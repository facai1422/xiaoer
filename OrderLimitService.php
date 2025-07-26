<?php

namespace app\common\service;

use think\Db;

/**
 * 订单限制服务类
 * 使用新的订单限制配置表系统
 */
class OrderLimitService
{
    /**
     * 获取用户的订单限制
     * @param int $uid 用户ID
     * @return array
     */
    public static function getUserOrderLimit($uid)
    {
        // 获取用户信息
        $user = Db::name('xy_users')->find($uid);
        if (!$user) {
            return ['max_orders' => 0, 'can_order' => false, 'message' => '用户不存在'];
        }

        // 按优先级获取适用的配置（优先级高的优先）
        $configs = Db::name('xy_order_limit_config')
            ->where('status', 1)
            ->order('priority DESC')
            ->select();

        $maxOrders = 0;
        $configUsed = null;

        foreach ($configs as $config) {
            switch ($config['config_type']) {
                case 1: // 全局默认
                    if (!$configUsed) {
                        $maxOrders = $config['max_orders'];
                        $configUsed = $config;
                    }
                    break;
                    
                case 2: // 用户等级
                    if ($config['target_id'] == $user['level'] || $config['target_id'] == 0) {
                        $maxOrders = $config['max_orders'];
                        $configUsed = $config;
                        break 2; // 找到等级配置就跳出循环
                    }
                    break;
                    
                case 3: // 用户组
                    if ($config['target_id'] == $user['group_id']) {
                        $maxOrders = $config['max_orders'];
                        $configUsed = $config;
                        break 2;
                    }
                    break;
                    
                case 4: // 单个用户
                    if ($config['target_id'] == $uid) {
                        $maxOrders = $config['max_orders'];
                        $configUsed = $config;
                        break 2;
                    }
                    break;
            }
        }

        return [
            'max_orders' => $maxOrders,
            'config_used' => $configUsed,
            'user_info' => $user
        ];
    }

    /**
     * 检查用户是否可以下单
     * @param int $uid 用户ID
     * @return array
     */
    public static function checkCanOrder($uid)
    {
        $limitInfo = self::getUserOrderLimit($uid);
        $maxOrders = $limitInfo['max_orders'];
        $user = $limitInfo['user_info'];

        // 如果没有限制（0表示无限制）
        if ($maxOrders <= 0) {
            return [
                'can_order' => true,
                'message' => '无订单限制',
                'current_orders' => $user['deal_count'],
                'max_orders' => 0,
                'actual_orders' => 0
            ];
        }

        // 获取用户当前订单数（从用户表）
        $currentOrders = (int)$user['deal_count'];

        // 获取实际订单数（从订单表）
        $actualOrderCount = Db::name('xy_convey')
            ->where('uid', $uid)
            ->where('status', 'in', [1, 3, 5]) // 已完成的订单
            ->count('id');

        // 更新用户订单统计表
        self::updateUserOrderStats($uid, $actualOrderCount);

        // 双重检查：用户表的deal_count和实际订单数都不能超过限制
        $canOrder = ($currentOrders < $maxOrders) && ($actualOrderCount < $maxOrders);

      $message = $canOrder ? 
            'Order can be placed' : 
            "You have reached the maximum order limit ({$maxOrders} orders)! Currently, you have completed {$actualOrderCount} orders and cannot place additional orders.";

        // 记录检查日志
        self::logOrderLimitCheck($uid, isset($user['username']) ? $user['username'] : '', $maxOrders, $actualOrderCount, $canOrder ? 'allow' : 'block');

        return [
            'can_order' => $canOrder,
            'message' => $message,
            'current_orders' => $currentOrders,
            'max_orders' => $maxOrders,
            'actual_orders' => $actualOrderCount,
            'config_used' => isset($limitInfo['config_used']['config_name']) ? $limitInfo['config_used']['config_name'] : '默认配置'
        ];
    }

    /**
     * 更新用户订单统计
     * @param int $uid 用户ID
     * @param int $totalOrders 总订单数
     */
    private static function updateUserOrderStats($uid, $totalOrders)
    {
        $today = strtotime(date('Y-m-d'));
        $thisWeek = strtotime('this week');
        $thisMonth = strtotime(date('Y-m-01'));

        // 计算各时间段订单数
        $dailyOrders = Db::name('xy_convey')
            ->where('uid', $uid)
            ->where('status', 'in', [1, 3, 5])
            ->where('addtime', '>=', $today)
            ->count('id');

        $weeklyOrders = Db::name('xy_convey')
            ->where('uid', $uid)
            ->where('status', 'in', [1, 3, 5])
            ->where('addtime', '>=', $thisWeek)
            ->count('id');

        $monthlyOrders = Db::name('xy_convey')
            ->where('uid', $uid)
            ->where('status', 'in', [1, 3, 5])
            ->where('addtime', '>=', $thisMonth)
            ->count('id');

        // 更新或插入统计数据
        $stats = Db::name('xy_user_order_stats')->where('uid', $uid)->find();
        
        $data = [
            'uid' => $uid,
            'total_orders' => $totalOrders,
            'daily_orders' => $dailyOrders,
            'weekly_orders' => $weeklyOrders,
            'monthly_orders' => $monthlyOrders,
            'last_update_time' => time()
        ];

        if ($stats) {
            Db::name('xy_user_order_stats')->where('uid', $uid)->update($data);
        } else {
            Db::name('xy_user_order_stats')->insert($data);
        }
    }

    /**
     * 记录订单限制检查日志
     * @param int $uid 用户ID
     * @param string $username 用户名
     * @param int $limitValue 限制值
     * @param int $currentCount 当前订单数
     * @param string $action 操作结果
     */
    private static function logOrderLimitCheck($uid, $username, $limitValue, $currentCount, $action)
    {
        $data = [
            'uid' => $uid,
            'username' => $username,
            'limit_type' => 'total_orders',
            'limit_value' => $limitValue,
            'current_count' => $currentCount,
            'action' => $action,
            'ip' => request()->ip(),
            'user_agent' => request()->header('user-agent'),
            'created_time' => time()
        ];

        Db::name('xy_order_limit_log')->insert($data);
    }

    /**
     * 获取用户订单统计
     * @param int $uid 用户ID
     * @return array
     */
    public static function getUserOrderStats($uid)
    {
        $stats = Db::name('xy_user_order_stats')->where('uid', $uid)->find();
        
        if (!$stats) {
            // 如果没有统计数据，实时计算
            $totalOrders = Db::name('xy_convey')
                ->where('uid', $uid)
                ->where('status', 'in', [1, 3, 5])
                ->count('id');
            
            self::updateUserOrderStats($uid, $totalOrders);
            $stats = Db::name('xy_user_order_stats')->where('uid', $uid)->find();
        }

        return $stats ?: [
            'total_orders' => 0,
            'daily_orders' => 0,
            'weekly_orders' => 0,
            'monthly_orders' => 0
        ];
    }
} 
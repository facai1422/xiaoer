
export interface Database {
  prepare: (sql: string) => any;
  transaction: (fn: () => void) => void;
}

const db = {
  prepare: () => {},
  transaction: (fn: () => void) => fn(),
};

export default db;

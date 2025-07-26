
export const WaveBackground = () => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#543ab7] to-[#00acc1]">
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            className="waves relative w-full h-[15vh] min-h-[100px] max-h-[150px]" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28" 
            preserveAspectRatio="none" 
            shapeRendering="auto"
          >
            <defs>
              <path 
                id="gentle-wave" 
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" 
              />
            </defs>
            <g className="parallax">
              <use 
                xlinkHref="#gentle-wave" 
                x="48" 
                y="0" 
                fill="rgba(255, 255, 255, 0.7)" 
                className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-2s]"
              />
              <use 
                xlinkHref="#gentle-wave" 
                x="48" 
                y="3" 
                fill="rgba(255, 255, 255, 0.5)" 
                className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-3s]"
              />
              <use 
                xlinkHref="#gentle-wave" 
                x="48" 
                y="5" 
                fill="rgba(255, 255, 255, 0.3)" 
                className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-4s]"
              />
              <use 
                xlinkHref="#gentle-wave" 
                x="48" 
                y="7" 
                fill="#fff" 
                className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-5s]"
              />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
};

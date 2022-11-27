return (
  <div className="flex justify-center items-center h-screen">
    <div
      className={
        notification
          ? "visible transition-all fixed top-0 bg-gray-400 text-white w-10/12 text-xs md:text-sm text-center py-4 mt-2 rounded-full shadow-2xl"
          : "invisible fixed top-0"
      }
    >
      Please, bring your instrument near to the microphone!
    </div>
    <div className="flex flex-col items-center">
      <div
        className={
          started
            ? "visible flex flex-col transition-all ease-in delay-75 bg-gray-200 justify-center items-center p-10 rounded-xl shadow-lg mb-5 w-60 h-60"
            : "invisible transition-all w-0 h-0"
        }
      >
        <div className="flex items-start font-mono">
          <span
            className={
              started
                ? "visible transition-all delay-75 font-thin text-9xl"
                : "invisible text-xs"
            }
          >
            {pitchNote}
          </span>
          <span className="bg-green-600 p-1 px-2 text-white rounded-lg">
            {pitchScale}
          </span>
        </div>

        <div className="w-full flex justify-center items-center">
          <div
            className="bg-gradient-to-r to-green-400 from-red-600 py-1 rounded-full rotate-180"
            style={{
              width: (detune < 0 ? getDetunePercent(detune) : "50") + "%",
            }}
          ></div>
          <span className="font-bold text-lg text-green-800">I</span>
          <div
            className="bg-gradient-to-r from-green-400 to-red-600 py-1 rounded-full"
            style={{
              width: (detune > 0 ? getDetunePercent(detune) : "50") + "%",
            }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          <span>{pitch}</span>
        </div>
      </div>
      {!started ? (
        <button
          className="bg-red-600 text-white w-20 h-20 rounded-full shadow-xl transition-all"
          onClick={start}
        >
          Start
        </button>
      ) : (
        <button
          className="bg-red-800 text-white w-20 h-20 rounded-full shadow-xl transition-all"
          onClick={stop}
        >
          Stop
        </button>
      )}
    </div>
  </div>
);
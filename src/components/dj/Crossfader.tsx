interface CrossfaderProps {
  value: number;
  onChange: (value: number) => void;
}

const Crossfader = ({ value, onChange }: CrossfaderProps) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      <div className="flex justify-between w-full text-[10px] font-semibold uppercase tracking-wider">
        <span className="text-deck-a">A</span>
        <span className="text-muted-foreground">CROSSFADER</span>
        <span className="text-deck-b">B</span>
      </div>
      <div className="crossfader-track w-full relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 appearance-none bg-transparent cursor-pointer relative z-10
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:bg-gradient-to-b
            [&::-webkit-slider-thumb]:from-white
            [&::-webkit-slider-thumb]:to-gray-300
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing"
        />
      </div>
    </div>
  );
};

export default Crossfader;

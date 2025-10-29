import { Card } from "@/components/ui/card";

interface StateMatrixProps {
  state: number[][];
  title: string;
  highlight?: boolean;
}

const StateMatrix = ({ state, title, highlight = false }: StateMatrixProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      <Card className={`p-4 ${highlight ? 'border-primary shadow-lg shadow-primary/20' : ''}`}>
        <div className="grid grid-cols-4 gap-2">
          {state.map((row, rowIdx) =>
            row.map((byte, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className="flex items-center justify-center p-3 bg-muted rounded text-xs font-mono text-primary"
              >
                {byte.toString(16).padStart(2, '0').toUpperCase()}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default StateMatrix;

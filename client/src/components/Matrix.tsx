// import "../aes/aes.css";

// type ByteValue = number | string;
// type MatrixInput = ByteValue[] | ByteValue[][];

// interface MatrixProps {
//   matrix: MatrixInput;
// }

// // Convert flat array of 16 bytes into 4x4 matrix
// function to4x4Matrix(input: MatrixInput): string[][] {
//   let bytes: string[];

//   // If already 2D, convert each value to HEX string
//   if (Array.isArray(input[0])) {
//     return (input as ByteValue[][]).map(row =>
//       row.map(v =>
//         typeof v === "number"
//           ? v.toString(16).toUpperCase().padStart(2, "0")
//           : v.toString().toUpperCase().padStart(2, "0")
//       )
//     );
//   }

//   // Convert 1D -> hex strings
//   bytes = (input as ByteValue[]).map(v =>
//     typeof v === "number"
//       ? v.toString(16).toUpperCase().padStart(2, "0")
//       : v.toString().toUpperCase().padStart(2, "0")
//   );

//   // Force into 4x4
//   const matrix: string[][] = [];
//   for (let i = 0; i < 16; i += 4) {
//     matrix.push(bytes.slice(i, i + 4));
//   }

//   return matrix;
// }

// export default function Matrix({ matrix }: MatrixProps) {
//   const m = to4x4Matrix(matrix);

//   return (
//     <div className="matrix-grid">
//       {m.flat().map((cell, i) => (
//         <div key={i} className="matrix-cell">
//           {cell}
//         </div>
//       ))}
//     </div>
//   );
// }
// src/components/Matrix.tsx
import "../aes/aes.css";

type ByteValue = number | string;
type MatrixInput = ByteValue[] | ByteValue[][];

interface MatrixProps {
  matrix: MatrixInput;
  previous?: MatrixInput; // optional previous step for comparison
}

function normalize(input: MatrixInput): string[] {
  return Array.isArray(input[0])
    ? (input as ByteValue[][]).flat().map(v =>
        typeof v === "number"
          ? v.toString(16).toUpperCase().padStart(2, "0")
          : v.toString().toUpperCase().padStart(2, "0")
      )
    : (input as ByteValue[]).map(v =>
        typeof v === "number"
          ? v.toString(16).toUpperCase().padStart(2, "0")
          : v.toString().toUpperCase().padStart(2, "0")
      );
}

export default function Matrix({ matrix, previous }: MatrixProps) {
  const curFlat = normalize(matrix);

  const prevFlat = previous ? normalize(previous) : null;

  return (
    <div className="matrix-grid">
      {curFlat.map((cell, idx) => {
        const changed =
          prevFlat ? prevFlat[idx].toUpperCase() !== cell.toUpperCase() : false;

        return (
          <div
            key={idx}
            className={`matrix-cell ${
              changed ? "changed" : "unchanged"
            }`}
          >
            {cell}
          </div>
        );
      })}
    </div>
  );
}

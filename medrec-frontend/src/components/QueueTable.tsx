"use client";

type Queue = {
  id: number;
  number: number;
  status: "WAITING" | "CALLED" | "DONE";
  patient: {
    name: string;
    medicalRecordNumber: string;
  };
};

type Props = {
  queues: Queue[];

  // optional actions (diinject dari parent)
  onCall?: (queueId: number) => void;
  onSoap?: (queueId: number) => void;
  onDone?: (queueId: number) => void;
};

export default function QueueTable({
  queues,
  onCall,
  onSoap,
  onDone,
}: Props) {
  return (
    <table className="w-full border border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-2 py-1">No</th>
          <th className="border px-2 py-1">No RM</th>
          <th className="border px-2 py-1">Nama Pasien</th>
          <th className="border px-2 py-1">Status</th>
          <th className="border px-2 py-1">Aksi</th>
        </tr>
      </thead>

      <tbody>
        {queues.map((q, idx) => (
          <tr key={q.id}>
            <td className="border px-2 py-1 text-center">
              {idx + 1}
            </td>

            <td className="border px-2 py-1">
              {q.patient.medicalRecordNumber}
            </td>

            <td className="border px-2 py-1">
              {q.patient.name}
            </td>

            <td className="border px-2 py-1 text-center font-semibold">
              {q.status}
            </td>

            <td className="border px-2 py-1 text-center space-x-2">
              {q.status === "WAITING" && onCall && (
                <button
                  onClick={() => onCall(q.id)}
                  className="text-blue-600 hover:underline"
                >
                  Panggil
                </button>
              )}

              {q.status === "CALLED" && onSoap && (
                <button
                  onClick={() => onSoap(q.id)}
                  className="text-green-600 hover:underline"
                >
                  SOAP
                </button>
              )}

              {q.status === "CALLED" && onDone && (
                <button
                  onClick={() => onDone(q.id)}
                  className="text-purple-600 hover:underline"
                >
                  DONE
                </button>
              )}

              {q.status === "DONE" && <span>—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

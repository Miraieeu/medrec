type Queue = {
  id: number;
  number: number;
  status: "WAITING" | "CALLED" | "DONE";
  patient: { name: string };
};

type Props = {
  queues: Queue[];
  role: "registration" | "nurse" | "doctor" | "admin";
  onCall?: (id: number) => void;
  onDone?: (id: number) => void;
};

export default function QueueTable({
  queues,
  role,
  onCall,
  onDone,
}: Props) {
  return (
    <table className="w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">No</th>
          <th className="border p-2">Pasien</th>
          <th className="border p-2">Status</th>
          {role !== "registration" && <th className="border p-2">Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {queues.map((q) => (
          <tr key={q.id}>
            <td className="border p-2">{q.number}</td>
            <td className="border p-2">{q.patient.name}</td>
            <td className="border p-2">{q.status}</td>

            {role === "nurse" && q.status === "WAITING" && (
              <td className="border p-2">
                <button
                  onClick={() => onCall?.(q.id)}
                  className="bg-green-600 px-3 py-1 text-white"
                >
                  Panggil
                </button>
              </td>
            )}

            {role === "doctor" && q.status === "CALLED" && (
              <td className="border p-2">
                <button
                  onClick={() => onDone?.(q.id)}
                  className="bg-red-600 px-3 py-1 text-white"
                >
                  Selesai
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

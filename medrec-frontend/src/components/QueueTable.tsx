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
  queues?: Queue[];
  role: "registration" | "nurse" | "doctor";
  onCall?: (queueId: number) => void;
  onDone?: (queueId: number) => void;
};

export default function QueueTable({
  queues = [],
  role,
  onCall,
  onDone,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 w-16 text-center">
              No
            </th>
            <th className="border px-3 py-2 w-40 text-center">
              No. RM
            </th>
            <th className="border px-3 py-2 text-left">
              Nama Pasien
            </th>
            <th className="border px-3 py-2 w-32 text-center">
              Status
            </th>

            {(role === "nurse" || role === "doctor") && (
              <th className="border px-3 py-2 w-32 text-center">
                Aksi
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {queues.length === 0 && (
            <tr>
              <td
                colSpan={role === "registration" ? 4 : 5}
                className="border px-3 py-4 text-center text-gray-500"
              >
                Belum ada antrian
              </td>
            </tr>
          )}

          {queues.map((q) => (
            <tr
              key={q.id}
              className="hover:bg-gray-50 transition"
            >
              {/* No Antrian */}
              <td className="border px-3 py-2 text-center">
                {q.number}
              </td>

              {/* Nomor RM */}
              <td className="border px-3 py-2 text-center font-mono">
                {q.patient.medicalRecordNumber}
              </td>

              {/* Nama Pasien */}
              <td className="border px-3 py-2">
                {q.patient.name}
              </td>

              {/* Status */}
              <td className="border px-3 py-2 text-center font-semibold">
                {q.status}
              </td>

              {/* AKSI */}
              {(role === "nurse" || role === "doctor") && (
                <td className="border px-3 py-2 text-center">
                  {role === "nurse" && q.status === "WAITING" && (
                    <button
                      onClick={() => onCall?.(q.id)}
                      className="rounded bg-blue-600 px-3 py-1 text-white text-sm hover:bg-blue-700"
                    >
                      CALL
                    </button>
                  )}

                  {role === "doctor" && q.status === "CALLED" && (
                    <button
                      onClick={() => onDone?.(q.id)}
                      className="rounded bg-green-600 px-3 py-1 text-white text-sm hover:bg-green-700"
                    >
                      DONE
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

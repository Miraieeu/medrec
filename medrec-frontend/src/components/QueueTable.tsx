import { useRouter } from "next/navigation";

type Queue = {
  id: number;
  number: number;
  status: "WAITING" | "CALLED" | "DONE";
  patient: {
    name: string;
    medicalRecordNumber: string;
  };
};

export default function QueueTable({
  queues,
}: {
  queues: Queue[];
}) {
  const router = useRouter();

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

            <td className="border px-2 py-1 text-center">
              {/* WAITING → CALL */}
              {q.status === "WAITING" && (
                <button
                  onClick={() =>
                    router.push(`/nurse/queue/${q.id}/call`)
                  }
                  className="text-blue-600 hover:underline"
                >
                  Panggil
                </button>
              )}

              {/* CALLED → SOAP */}
              {q.status === "CALLED" && (
                <button
                  onClick={() =>
                    router.push(`/nurse/records/${q.id}`)
                  }
                  className="text-green-600 hover:underline"
                >
                  SOAP
                </button>
              )}

              {/* DONE → NONE */}
              {q.status === "DONE" && <span>—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

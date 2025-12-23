// app/records/[id]/page.tsx

// Pastikan ada 'export default' function
export default function RecordDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Halaman Detail Record: {params.id}</h1>
      <p>Sedang dalam perbaikan...</p>
    </div>
  );
}
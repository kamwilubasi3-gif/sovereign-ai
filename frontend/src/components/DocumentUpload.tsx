import { useState, useEffect } from "react";

interface Doc {
  id: number;
  filename: string;
  department: string;
  access_level: string;
  chunk_count: number;
  created_at: string;
}

export default function DocumentUpload() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [department, setDepartment] = useState("general");
  const [accessLevel, setAccessLevel] = useState("standard");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const loadDocs = async () => {
    try {
      const res = await fetch("/documents/");
      if (res.ok) setDocs(await res.json());
    } catch {}
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus("Uploading and processing...");

    const form = new FormData();
    form.append("file", file);
    form.append("department", department);
    form.append("access_level", accessLevel);

    try {
      const res = await fetch("/documents/upload", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        setStatus(`Ingested: ${data.filename} (${data.chunk_count} chunks)`);
        setFile(null);
        loadDocs();
      } else {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        setStatus(`Error: ${err.detail}`);
      }
    } catch (e: any) {
      setStatus(`Connection error: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">PDF File</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 file:cursor-pointer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Department</label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Access Level</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
              >
                <option value="standard">Standard</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>
          <button
            onClick={upload}
            disabled={!file || uploading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {uploading ? "Processing..." : "Upload & Ingest"}
          </button>
          {status && (
            <p className={`text-sm ${status.startsWith("Error") || status.startsWith("Connection") ? "text-red-400" : "text-green-400"}`}>
              {status}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Ingested Documents</h2>
        {docs.length === 0 ? (
          <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-400 text-left">
                <tr>
                  <th className="px-4 py-2">Filename</th>
                  <th className="px-4 py-2">Department</th>
                  <th className="px-4 py-2">Access</th>
                  <th className="px-4 py-2">Chunks</th>
                  <th className="px-4 py-2">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t border-gray-800">
                    <td className="px-4 py-2 text-white">{d.filename}</td>
                    <td className="px-4 py-2 text-gray-300">{d.department}</td>
                    <td className="px-4 py-2 text-gray-300">{d.access_level}</td>
                    <td className="px-4 py-2 text-gray-300">{d.chunk_count}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {d.created_at ? new Date(d.created_at).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

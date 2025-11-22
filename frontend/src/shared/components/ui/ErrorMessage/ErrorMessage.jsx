export default function ErrorMessage({ error, retry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Något gick fel
      </h3>
      <p className="text-red-700 mb-4">{error?.message || 'Ett oväntat fel inträffade'}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Försök igen
        </button>
      )}
    </div>
  )
}

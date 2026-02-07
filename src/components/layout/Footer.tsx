import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4 mb-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-medium text-gray-900">Eulesia</span>
            <span className="text-gray-400">·</span>
            <span>Suomi</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-gray-900 transition-colors">
              Tietoa
            </Link>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">Avoin lähdekoodi · Ei voittoa tavoitteleva</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          Kansalaisinfrastruktuuria yhteiseksi hyväksi. Datasi ei ole tuote.
        </div>
      </div>
    </footer>
  )
}

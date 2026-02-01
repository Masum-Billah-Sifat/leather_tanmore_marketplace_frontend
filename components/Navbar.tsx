// components/Navbar.tsx
export default function Navbar() {
  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">🛒 MyShop</h1>
        <nav className="space-x-6 text-gray-600">
          <a href="#" className="hover:text-black">Home</a>
          <a href="#" className="hover:text-black">Products</a>
          <a href="#" className="hover:text-black">About</a>
        </nav>
      </div>
    </header>
  )
}

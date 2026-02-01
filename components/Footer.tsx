// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="w-full border-t bg-gray-100 py-6 mt-12 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} MyShop. All rights reserved.
    </footer>
  )
}

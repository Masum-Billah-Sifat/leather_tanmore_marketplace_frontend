// // components/Footer.tsx
// export default function Footer() {
//   return (
//     <footer className="w-full border-t bg-gray-100 py-6 mt-12 text-center text-sm text-gray-500">
//       © {new Date().getFullYear()} MyShop. All rights reserved.
//     </footer>
//   )
// }


// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 bg-[rgb(var(--surface))] mt-14">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-lg font-semibold tracking-tight text-[rgb(var(--text))]">
            TANMORE
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))] leading-relaxed">
            Premium leather marketplace for bags, wallets, belts, and handcrafted essentials.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-[rgb(var(--text))]">Shop</div>
          <ul className="mt-3 space-y-2 text-sm text-[rgb(var(--muted))]">
            <li className="hover:text-[rgb(var(--text))] cursor-pointer">New Arrivals</li>
            <li className="hover:text-[rgb(var(--text))] cursor-pointer">Best Sellers</li>
            <li className="hover:text-[rgb(var(--text))] cursor-pointer">All Products</li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-[rgb(var(--text))]">Support</div>
          <ul className="mt-3 space-y-2 text-sm text-[rgb(var(--muted))]">
            <li className="hover:text-[rgb(var(--text))] cursor-pointer">Shipping & Returns</li>
            <li className="hover:text-[rgb(var(--text))] cursor-pointer">FAQ</li>
            <li className="hover:text-[rgb(var(--text))] cursor-pointer">Contact</li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-[rgb(var(--text))]">Legal</div>
          <ul className="mt-3 space-y-2 text-sm text-[rgb(var(--muted))]">
            <li className="hover:text-[rgb(var(--text))] cursor-pointer">Privacy Policy</li>
            <li className="hover:text-[rgb(var(--text))] cursor-pointer">Terms</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/5">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p className="text-sm text-[rgb(var(--muted))]">
            © {new Date().getFullYear()} TANMORE. All rights reserved.
          </p>
          <p className="text-sm text-[rgb(var(--muted))]">
            Crafted for a premium leather shopping experience.
          </p>
        </div>
      </div>
    </footer>
  );
}

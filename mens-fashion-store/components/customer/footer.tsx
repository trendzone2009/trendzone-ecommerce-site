import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">Men's Fashion Store</h3>
            <p className="text-sm text-gray-600">
              Your one-stop destination for premium men's clothing. Quality fashion for the modern man.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-primary">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=t-shirts" className="text-gray-600 hover:text-primary">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?category=shirts" className="text-gray-600 hover:text-primary">
                  Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?category=jeans" className="text-gray-600 hover:text-primary">
                  Jeans
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping-policy" className="text-gray-600 hover:text-primary">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-600 hover:text-primary">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: support@mensfashion.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: Your Store Address</li>
              <li className="pt-2">
                <strong>Hours:</strong> Mon-Sat, 10 AM - 8 PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Men's Fashion Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

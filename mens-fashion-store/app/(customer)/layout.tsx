import { Header } from '@/components/customer/header';
import { Footer } from '@/components/customer/footer';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

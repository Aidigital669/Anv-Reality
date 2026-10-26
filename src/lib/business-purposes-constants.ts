export interface BusinessPurpose {
  id: number;
  name: string;
  slug: string;
  isActive?: boolean;
}

export const INITIAL_BUSINESS_PURPOSES: { name: string; slug: string }[] = [
  { name: 'Jewellery Shop / Showroom', slug: 'jewellery-showroom' },
  { name: 'Clothing / Fashion Store', slug: 'clothing-store' },
  { name: 'Car Showroom / Dealership', slug: 'car-showroom' },
  { name: 'Two-Wheeler Showroom', slug: 'two-wheeler-showroom' },
  { name: 'Electronics / Mobile Store', slug: 'electronics-store' },
  { name: 'Furniture Showroom', slug: 'furniture-showroom' },
  { name: 'Grocery / Supermarket', slug: 'grocery-supermarket' },
  { name: 'Restaurant / Café', slug: 'restaurant-cafe' },
  { name: 'Bakery / Sweet Shop', slug: 'bakery-sweet-shop' },
  { name: 'Pharmacy / Medical Store', slug: 'pharmacy-medical-store' },
  { name: 'Salon / Beauty Parlour', slug: 'salon-beauty-parlour' },
  { name: 'Gym / Fitness Centre', slug: 'gym-fitness-centre' },
  { name: 'Bank / Financial Services', slug: 'bank-financial-services' },
  { name: 'Office / Consultancy', slug: 'office-consultancy' },
  { name: 'Hardware / Building Materials', slug: 'hardware-building-materials' },
  { name: 'Home Decor / Interior Showroom', slug: 'home-decor-interior-showroom' },
  { name: 'Footwear Store', slug: 'footwear-store' },
  { name: 'Optical Store', slug: 'optical-store' },
  { name: 'Educational / Coaching Centre', slug: 'educational-coaching-centre' },
  { name: 'Clinic / Diagnostic Centre', slug: 'clinic-diagnostic-centre' },
  { name: 'Other Business', slug: 'other-business' }
];

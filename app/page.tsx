import Link from "next/link"
import { Building, Calendar, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const features = [
    {
      icon: Building,
      title: "Premium Locations",
      description: "Access to top co-working spaces in prime locations",
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Book your workspace with just a few clicks",
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Choose the time that works best for your schedule",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with like-minded professionals",
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-blue-100 mb-6">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find Your Perfect <span className="text-blue-600">Workspace</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
            Book co-working spaces, meeting rooms, and private offices with ease. Join our community of professionals
            and elevate your work experience.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/spaces">Explore Spaces</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CoSpace?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to find your workspace?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-10">
            Join thousands of professionals who have already discovered the perfect workspace for their needs.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
            <Link href="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}


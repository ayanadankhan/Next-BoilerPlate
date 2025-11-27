import Link from 'next/link';
import { 
  Clapperboard, 
  Users, 
  Layers, 
  ArrowRight, 
  Database, 
  Server, 
  ShieldCheck,
  LayoutTemplate
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const modules = [
    {
      title: "Items",
      description: "Full CRUD repository for library items. Manage subjects, durations, and hierarchical classifications.",
      icon: Clapperboard,
      href: "/media-assets",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Genere",
      description: "Configure the system hierarchy. Manage Main Categories (Genres) and linked Subcategories (Items).",
      icon: Layers,
      href: "/categories",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "User Management",
      description: "Administer system access, manage roles, and handle user authentication details.",
      icon: Users,
      href: "/users",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to FCCE Library</h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          A professional platform designed to organize and manage media assets through a smart hierarchical category system.
        </p>
      </div>

      {/* Main Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-2 rounded-lg ${module.bgColor}`}>
                <module.icon className={`h-6 w-6 ${module.color}`} />
              </div>
              <CardTitle className="text-xl">{module.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed mt-2">
                {module.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="ghost" className="w-full justify-between group mt-2">
                <Link href={module.href}>
                  Access Module 
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Technical Overview Section */}
      {/* <div className="pt-6">
        <h2 className="text-sm font-semibold mb-4 text-slate-500 uppercase tracking-wider">System Architecture</h2>
        <Card className="bg-slate-50/50 border-slate-200">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md border shadow-sm">
                  <Server className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">Next.js App Router</p>
                  <p className="text-xs text-slate-500">Framework</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md border shadow-sm">
                  <Database className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">MongoDB & Mongoose</p>
                  <p className="text-xs text-slate-500">Database</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md border shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">Secure API Routes</p>
                  <p className="text-xs text-slate-500">Backend</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white rounded-md border shadow-sm">
                  <LayoutTemplate className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">Shadcn UI</p>
                  <p className="text-xs text-slate-500">Design System</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
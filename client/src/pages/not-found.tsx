import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">404 Page Not Found</h1>
            <p className="text-muted-foreground">
              We couldn't find the page you were looking for. It might have been moved or doesn't exist.
            </p>
          </div>

          <Link href="/">
            <Button className="w-full" size="lg">
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

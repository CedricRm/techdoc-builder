"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FilePlus2, FolderPlus, UploadCloud } from "lucide-react";

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/projects">
              <FolderPlus className="mr-2 size-4" /> Nouveau projet
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="#">
              <FilePlus2 className="mr-2 size-4" /> Nouveau document
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="#">
              <UploadCloud className="mr-2 size-4" /> Importer
            </Link>
          </Button>
        </div>
        <Separator className="my-4" />
        <p className="text-xs text-muted-foreground">
          Conseil: centralisez vos modèles de documents et générez des PDF en un
          clic.
        </p>
      </CardContent>
    </Card>
  );
}

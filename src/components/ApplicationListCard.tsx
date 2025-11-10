import type { Application } from "@/types/application";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Mail, GraduationCap, User } from "lucide-react";

interface ApplicationListCardProps {
  application: Application;
  onClick: () => void;
}

export const ApplicationListCard = ({ application, onClick }: ApplicationListCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card
      className="w-full hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Nombre */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">{application.nombre_completo}</h3>
              {application.apodo && (
                <p className="text-sm text-muted-foreground">"{application.apodo}"</p>
              )}
            </div>
          </div>

          {/* Información en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {/* Fecha de postulación */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {formatDate(application.created_at)}
              </span>
            </div>

            {/* Correo */}
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {application.correo_institucional}
              </span>
            </div>
          </div>

          {/* Carrera */}
          <div className="flex items-start gap-2 pt-1">
            <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm text-muted-foreground line-clamp-2">
              {application.carrera}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


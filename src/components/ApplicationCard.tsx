import type { Application } from "@/types/application";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Calendar, Clock, BookOpen, Users } from "lucide-react";

interface ApplicationCardProps {
  application: Application;
}

export const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const areas = [
    application.area_interes1,
    application.area_interes2,
    application.area_interes3,
  ].filter(Boolean);

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{application.nombre_completo}</CardTitle>
            <CardDescription className="mt-1">
              {application.apodo && `"${application.apodo}" • `}
              {application.rut}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            ID: {application.id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información Personal */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{application.correo_institucional}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{application.edad} años</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Campus:</span> {application.campus}
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Información Académica
          </h3>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Carrera:</span> {application.carrera}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <span className="font-medium">Año de ingreso:</span> {application.anio_ingreso}
              </div>
              <div className="text-sm">
                <span className="font-medium">Año actual:</span> {application.anio_actual}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Ayudantías:</span> {application.ayudantias}
              </span>
            </div>
          </div>
        </div>

        {/* Áreas de Interés */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Áreas de Interés
          </h3>
          <div className="flex flex-wrap gap-2">
            {areas.map((area, index) => (
              <Badge key={index} variant="default">
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Disponibilidad y Motivación
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">Horas semanales:</span>{" "}
              {application.horas_disponibles_semanales}h
            </span>
          </div>
          <div className="text-sm bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">Motivo de postulación:</p>
            <p className="text-muted-foreground">{application.motivo_postulacion}</p>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Información Adicional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="text-sm">
              <span className="font-medium">Proyecto/Idea:</span> {application.proyecto_idea}
            </div>
            <div className="text-sm">
              <span className="font-medium">Pitch:</span> {application.pitch}
            </div>
            {application.postulacion_conjunta && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Postulación conjunta con:</span>{" "}
                  {application.postulacion_conjunta}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Portafolio y Fecha */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Postulado el {formatDate(application.created_at)}
          </div>
          {application.portafolio && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={application.portafolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Portafolio
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

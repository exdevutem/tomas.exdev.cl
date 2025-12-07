import type { Application } from "@/types/application";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VotingPanel } from "@/components/VotingPanel";
import { ApplicationVoteCharts } from "@/components/ApplicationVoteCharts";
import { ExternalLink, Mail, Calendar, Clock, BookOpen, Users, GraduationCap, User, FileText, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useEffect } from "react";

interface ApplicationDetailsModalProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const ApplicationDetailsModal = ({ 
  application, 
  open, 
  onOpenChange, 
  onNavigatePrevious,
  onNavigateNext,
  hasPrevious = false,
  hasNext = false
}: ApplicationDetailsModalProps) => {
  const { canVote, canViewVoteDetails } = usePermissions();
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, select or contenteditable element
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable) {
        return;
      }
      
      if (event.key === 'ArrowLeft' && hasPrevious && onNavigatePrevious) {
        event.preventDefault();
        onNavigatePrevious();
      } else if (event.key === 'ArrowRight' && hasNext && onNavigateNext) {
        event.preventDefault();
        onNavigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasPrevious, hasNext, onNavigatePrevious, onNavigateNext]);
  
  if (!application) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto relative">
        {/* Navigation Arrows */}
        {hasPrevious && onNavigatePrevious && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-md"
            onClick={onNavigatePrevious}
            aria-label="Postulación anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}
        
        {hasNext && onNavigateNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-md"
            onClick={onNavigateNext}
            aria-label="Siguiente postulación"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
        
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">{application.nombre_completo}</DialogTitle>
              <DialogDescription className="mt-1">
                {application.apodo && `"${application.apodo}" • `}
                {application.rut}
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-sm flex-shrink-0">
              ID: {application.id}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="detalle" className="w-full">
          <TabsList className={`grid w-full ${canVote() || canViewVoteDetails() ? "max-w-md grid-cols-2" : "max-w-xs grid-cols-1"}`}>
            <TabsTrigger value="detalle" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Detalle
            </TabsTrigger>
            {(canVote() || canViewVoteDetails()) && (
              <TabsTrigger value="votaciones" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Votaciones
              </TabsTrigger>
            )}
          </TabsList>

          {/* Pestaña de Detalle */}
          <TabsContent value="detalle" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna izquierda y central - Información de la postulación */}
              <div className="lg:col-span-2 space-y-6">
                {/* Información Personal */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{application.correo_institucional}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{application.edad} años</span>
                    </div>
                    <div className="text-sm col-span-full">
                      <span className="font-medium">Campus:</span> {application.campus}
                    </div>
                  </div>
                </div>

                {/* Información Académica */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Información Académica
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{application.carrera}</span>
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
                <div className="space-y-3">
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
                <div className="space-y-3">
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
                <div className="space-y-3">
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
                      <div className="flex items-center gap-2 col-span-full">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
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
              </div>

              {/* Columna derecha - Panel de Votación */}
              <div className="lg:col-span-1">
                <div className="sticky top-0">
                  {(canVote() || canViewVoteDetails()) && (
                    <>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                        Tu Votación
                      </h3>
                      <VotingPanel applicationRut={application.rut} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Pestaña de Votaciones */}
          {(canVote() || canViewVoteDetails()) && (
            <TabsContent value="votaciones" className="mt-6">
              <ApplicationVoteCharts
                applicationRut={application.rut}
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

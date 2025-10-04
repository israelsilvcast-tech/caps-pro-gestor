import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Procedure {
  id: string;
  sigtap_code: string;
  description: string;
  procedure_type?: string;
  active: boolean;
}

export default function Procedimentos() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    sigtap_code: "",
    description: "",
    procedure_type: "",
    active: true,
  });

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    try {
      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .order("sigtap_code");
      
      if (error) throw error;
      setProcedures(data || []);
    } catch (error) {
      console.error("Erro ao carregar procedimentos:", error);
      toast.error("Erro ao carregar procedimentos");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.sigtap_code || !formData.description) {
        toast.error("Código SIGTAP e Descrição são obrigatórios!");
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from("procedures")
          .update(formData)
          .eq("id", editingId);
        
        if (error) throw error;
        toast.success("Procedimento atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("procedures")
          .insert([formData]);
        
        if (error) throw error;
        toast.success("Procedimento cadastrado com sucesso!");
      }

      resetForm();
      loadProcedures();
    } catch (error: any) {
      console.error("Erro ao salvar procedimento:", error);
      toast.error(error.message || "Erro ao salvar procedimento");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (procedure: Procedure) => {
    setFormData({
      sigtap_code: procedure.sigtap_code,
      description: procedure.description,
      procedure_type: procedure.procedure_type || "",
      active: procedure.active,
    });
    setEditingId(procedure.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este procedimento?")) return;

    try {
      const { error } = await supabase
        .from("procedures")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Procedimento excluído!");
      loadProcedures();
    } catch (error) {
      console.error("Erro ao excluir procedimento:", error);
      toast.error("Erro ao excluir procedimento");
    }
  };

  const resetForm = () => {
    setFormData({
      sigtap_code: "",
      description: "",
      procedure_type: "",
      active: true,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Stethoscope className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Cadastro de Procedimentos</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Procedimento</CardTitle>
            <CardDescription>SIGTAP - Sistema de Gerenciamento da Tabela de Procedimentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sigtap_code">Código SIGTAP *</Label>
                <Input
                  id="sigtap_code"
                  value={formData.sigtap_code}
                  onChange={(e) => setFormData({ ...formData, sigtap_code: e.target.value })}
                  maxLength={10}
                  placeholder="Ex: 0301060096"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procedure_type">Tipo do Procedimento</Label>
                <Input
                  id="procedure_type"
                  value={formData.procedure_type}
                  onChange={(e) => setFormData({ ...formData, procedure_type: e.target.value })}
                  maxLength={50}
                  placeholder="Ex: Psicossocial"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={250}
                placeholder="Ex: Atendimento Individual"
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="gap-2">
            <Plus className="h-4 w-4" />
            {editingId ? "Atualizar Procedimento" : "Salvar Procedimento"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar Edição
            </Button>
          )}
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Procedimentos Cadastrados</CardTitle>
          <CardDescription>Total: {procedures.length} procedimento(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código SIGTAP</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum procedimento cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                procedures.map((procedure) => (
                  <TableRow key={procedure.id}>
                    <TableCell className="font-mono">{procedure.sigtap_code}</TableCell>
                    <TableCell className="font-medium">{procedure.description}</TableCell>
                    <TableCell>{procedure.procedure_type || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={procedure.active ? "default" : "secondary"}>
                        {procedure.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(procedure)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(procedure.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

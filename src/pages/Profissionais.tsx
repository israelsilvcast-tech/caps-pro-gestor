import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Professional {
  id: string;
  name: string;
  cbo_code: string;
  cbo_description: string;
  cpf?: string;
  cns?: string;
  active: boolean;
}

export default function Profissionais() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    cbo_code: "",
    cbo_description: "",
    cpf: "",
    cns: "",
    active: true,
  });

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      toast.error("Erro ao carregar profissionais");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.cbo_code || !formData.cbo_description) {
        toast.error("Nome, Código CBO e Descrição são obrigatórios!");
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from("professionals")
          .update(formData)
          .eq("id", editingId);
        
        if (error) throw error;
        toast.success("Profissional atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("professionals")
          .insert([formData]);
        
        if (error) throw error;
        toast.success("Profissional cadastrado com sucesso!");
      }

      resetForm();
      loadProfessionals();
    } catch (error: any) {
      console.error("Erro ao salvar profissional:", error);
      toast.error(error.message || "Erro ao salvar profissional");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (professional: Professional) => {
    setFormData({
      name: professional.name,
      cbo_code: professional.cbo_code,
      cbo_description: professional.cbo_description,
      cpf: professional.cpf || "",
      cns: professional.cns || "",
      active: professional.active,
    });
    setEditingId(professional.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este profissional?")) return;

    try {
      const { error } = await supabase
        .from("professionals")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Profissional excluído!");
      loadProfessionals();
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
      toast.error("Erro ao excluir profissional");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      cbo_code: "",
      cbo_description: "",
      cpf: "",
      cns: "",
      active: true,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCog className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Cadastro de Profissionais</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Profissional</CardTitle>
            <CardDescription>CBO - Classificação Brasileira de Ocupações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cbo_code">Código CBO *</Label>
                <Input
                  id="cbo_code"
                  value={formData.cbo_code}
                  onChange={(e) => setFormData({ ...formData, cbo_code: e.target.value })}
                  maxLength={6}
                  placeholder="Ex: 225125"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cbo_description">Descrição CBO *</Label>
                <Input
                  id="cbo_description"
                  value={formData.cbo_description}
                  onChange={(e) => setFormData({ ...formData, cbo_description: e.target.value })}
                  maxLength={200}
                  placeholder="Ex: Médico Psiquiatra"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  maxLength={11}
                  placeholder="11 dígitos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cns">CNS</Label>
                <Input
                  id="cns"
                  value={formData.cns}
                  onChange={(e) => setFormData({ ...formData, cns: e.target.value })}
                  maxLength={15}
                  placeholder="15 dígitos"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="gap-2">
            <Plus className="h-4 w-4" />
            {editingId ? "Atualizar Profissional" : "Salvar Profissional"}
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
          <CardTitle>Profissionais Cadastrados</CardTitle>
          <CardDescription>Total: {professionals.length} profissional(is)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CBO</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum profissional cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                professionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">{professional.name}</TableCell>
                    <TableCell>{professional.cbo_code}</TableCell>
                    <TableCell>{professional.cbo_description}</TableCell>
                    <TableCell>
                      <Badge variant={professional.active ? "default" : "secondary"}>
                        {professional.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(professional)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(professional.id)}
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

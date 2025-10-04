import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  cns?: string;
  cpf?: string;
  birth_date: string;
  sex: string;
  race_color: string;
  phone?: string;
  mobile?: string;
}

export default function Pacientes() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    prontuario: "",
    cns: "",
    cpf: "",
    name: "",
    birth_date: "",
    sex: "",
    race_color: "03",
    mother_name: "",
    responsible_name: "",
    address_street: "",
    address_number: "",
    address_complement: "",
    address_neighborhood: "",
    address_zipcode: "",
    phone: "",
    mobile: "",
    email: "",
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      toast.error("Erro ao carregar pacientes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.birth_date || !formData.sex) {
        toast.error("Nome, Data de Nascimento e Sexo são obrigatórios!");
        return;
      }

      if (!formData.cns && !formData.cpf) {
        toast.error("Informe CNS ou CPF!");
        return;
      }

      const patientData = {
        ...formData,
        cns: formData.cns || null,
        cpf: formData.cpf || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("patients")
          .update(patientData)
          .eq("id", editingId);
        
        if (error) throw error;
        toast.success("Paciente atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("patients")
          .insert([patientData]);
        
        if (error) throw error;
        toast.success("Paciente cadastrado com sucesso!");
      }

      resetForm();
      loadPatients();
    } catch (error: any) {
      console.error("Erro ao salvar paciente:", error);
      toast.error(error.message || "Erro ao salvar paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: any) => {
    setFormData(patient);
    setEditingId(patient.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este paciente?")) return;

    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Paciente excluído!");
      loadPatients();
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      toast.error("Erro ao excluir paciente");
    }
  };

  const resetForm = () => {
    setFormData({
      prontuario: "",
      cns: "",
      cpf: "",
      name: "",
      birth_date: "",
      sex: "",
      race_color: "03",
      mother_name: "",
      responsible_name: "",
      address_street: "",
      address_number: "",
      address_complement: "",
      address_neighborhood: "",
      address_zipcode: "",
      phone: "",
      mobile: "",
      email: "",
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cadastro de Pacientes</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identificação do Paciente</CardTitle>
            <CardDescription>Dados básicos de identificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prontuario">Prontuário</Label>
                <Input
                  id="prontuario"
                  value={formData.prontuario}
                  onChange={(e) => setFormData({ ...formData, prontuario: e.target.value })}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cns">CNS *</Label>
                <Input
                  id="cns"
                  value={formData.cns}
                  onChange={(e) => setFormData({ ...formData, cns: e.target.value })}
                  maxLength={15}
                  placeholder="15 dígitos"
                />
              </div>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={30}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sex">Sexo *</Label>
                <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="race_color">Raça/Cor *</Label>
                <Select value={formData.race_color} onValueChange={(value) => setFormData({ ...formData, race_color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">01 - Branca</SelectItem>
                    <SelectItem value="02">02 - Preta</SelectItem>
                    <SelectItem value="03">03 - Parda</SelectItem>
                    <SelectItem value="04">04 - Amarela</SelectItem>
                    <SelectItem value="05">05 - Indígena</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_name">Nome da Mãe</Label>
              <Input
                id="mother_name"
                value={formData.mother_name}
                onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsible_name">Nome do Responsável</Label>
              <Input
                id="responsible_name"
                value={formData.responsible_name}
                onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
                maxLength={30}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço e Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address_street">Logradouro</Label>
                <Input
                  id="address_street"
                  value={formData.address_street}
                  onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                  maxLength={30}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_number">Número</Label>
                <Input
                  id="address_number"
                  value={formData.address_number}
                  onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                  maxLength={5}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento</Label>
                <Input
                  id="address_complement"
                  value={formData.address_complement}
                  onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input
                  id="address_neighborhood"
                  value={formData.address_neighborhood}
                  onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                  maxLength={30}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_zipcode">CEP</Label>
                <Input
                  id="address_zipcode"
                  value={formData.address_zipcode}
                  onChange={(e) => setFormData({ ...formData, address_zipcode: e.target.value })}
                  maxLength={8}
                  placeholder="Apenas números"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={11}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Celular</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  maxLength={11}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={40}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="gap-2">
            <Plus className="h-4 w-4" />
            {editingId ? "Atualizar Paciente" : "Salvar Paciente"}
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
          <CardTitle>Pacientes Cadastrados</CardTitle>
          <CardDescription>Total: {patients.length} paciente(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNS/CPF</TableHead>
                <TableHead>Data Nasc.</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum paciente cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.cns || patient.cpf}</TableCell>
                    <TableCell>{new Date(patient.birth_date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{patient.mobile || patient.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(patient)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(patient.id)}
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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, AlertCircle, CheckCircle, Filter, RefreshCw } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { knowledgeBaseService } from "@/services/knowledgeBaseService";
import type { Tables } from "@/integrations/supabase/types";

// Use the Supabase generated types
type Ticket = Tables<'support_tickets'>;

const SupportDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = tickets;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }
    
    setFilteredTickets(filtered);
  }, [tickets, statusFilter, categoryFilter]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error fetching tickets",
          description: "Could not load support tickets",
          variant: "destructive",
        });
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const knowledgeBaseCategories = await knowledgeBaseService.getCategories();
      setCategories(knowledgeBaseCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error fetching categories",
        description: "Could not load category filters",
        variant: "destructive",
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket:', error);
        toast({
          title: "Error updating ticket",
          description: "Could not update ticket status",
          variant: "destructive",
        });
        return;
      }

      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );

      toast({
        title: "Ticket updated",
        description: `Ticket status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchTickets();
    fetchCategories();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'API Issue': 'bg-red-100 text-red-800',
      'Transaction Delay': 'bg-orange-100 text-orange-800',
      'Onboarding': 'bg-green-100 text-green-800',
      'Product Flow': 'bg-blue-100 text-blue-800',
      'Inventory': 'bg-purple-100 text-purple-800',
      'Customer Management': 'bg-teal-100 text-teal-800',
      'Daily Operations': 'bg-indigo-100 text-indigo-800',
      'Hardware Support': 'bg-yellow-100 text-yellow-800',
      'Multi-Location': 'bg-pink-100 text-pink-800',
      'Gift Cards': 'bg-cyan-100 text-cyan-800',
      'Task Request': 'bg-gray-100 text-gray-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-3xl font-bold text-red-600">{stats.open}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Closed</p>
                <p className="text-3xl font-bold text-green-600">{stats.closed}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No support tickets found.</p>
                <p className="text-sm">Try sending a message in the WhatsApp simulator to create some tickets!</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{ticket.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600">{ticket.customer_email || 'Anonymous'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getCategoryColor(ticket.category)}>
                        {ticket.category}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{ticket.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Created {new Date(ticket.created_at).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      {ticket.status !== 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketStatus(ticket.id, 'pending')}
                        >
                          Mark Pending
                        </Button>
                      )}
                      {ticket.status !== 'closed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketStatus(ticket.id, 'closed')}
                        >
                          Close Ticket
                        </Button>
                      )}
                      {ticket.status === 'closed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketStatus(ticket.id, 'open')}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportDashboard;

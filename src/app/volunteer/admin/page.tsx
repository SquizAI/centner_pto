'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, Users, ArrowLeft, Edit2, Trash2, Plus, Mail } from 'lucide-react'
import { AIContentHelper } from '@/components/ai/AIContentHelper'
import Link from 'next/link'

interface VolunteerOpportunity {
  id: string
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  campus: string
  max_volunteers: number
  current_signups: number
  requirements: string | null
  contact_email: string
  status: string
  created_at: string
  updated_at: string
}

export default function VolunteerAdminPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [editingOpportunity, setEditingOpportunity] = useState<VolunteerOpportunity | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    campus: 'all' as 'preschool' | 'elementary' | 'middle-high' | 'all',
    max_volunteers: '',
    requirements: '',
    contact_email: '',
    status: 'active' as 'active' | 'cancelled' | 'completed',
  })

  useEffect(() => {
    loadOpportunities()
  }, [])

  const loadOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setOpportunities(data || [])
    } catch (error) {
      console.error('Error loading opportunities:', error)
      toast.error('Failed to load volunteer opportunities')
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('You must be logged in to manage volunteer opportunities')
        return
      }

      // Prepare opportunity data
      const opportunityData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        campus: formData.campus,
        max_volunteers: parseInt(formData.max_volunteers),
        requirements: formData.requirements || null,
        contact_email: formData.contact_email,
        status: formData.status,
        created_by: user.id,
      }

      if (editingOpportunity) {
        // Update existing opportunity
        const { error } = await supabase
          .from('volunteer_opportunities')
          .update(opportunityData)
          .eq('id', editingOpportunity.id)

        if (error) throw error
        toast.success('Opportunity updated successfully!')
      } else {
        // Create new opportunity
        const { error } = await supabase
          .from('volunteer_opportunities')
          .insert([opportunityData])

        if (error) throw error
        toast.success('Opportunity created successfully!')
      }

      // Reset form and reload opportunities
      resetForm()
      loadOpportunities()
    } catch (error) {
      console.error('Error saving opportunity:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save opportunity')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (opportunity: VolunteerOpportunity) => {
    setEditingOpportunity(opportunity)
    setFormData({
      title: opportunity.title,
      description: opportunity.description,
      date: opportunity.date,
      start_time: opportunity.start_time,
      end_time: opportunity.end_time,
      location: opportunity.location,
      campus: opportunity.campus as any,
      max_volunteers: opportunity.max_volunteers.toString(),
      requirements: opportunity.requirements || '',
      contact_email: opportunity.contact_email,
      status: opportunity.status as any,
    })
    setShowForm(true)
  }

  const handleDelete = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this volunteer opportunity?')) return

    try {
      const { error } = await supabase
        .from('volunteer_opportunities')
        .delete()
        .eq('id', opportunityId)

      if (error) throw error
      toast.success('Opportunity deleted successfully')
      loadOpportunities()
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      toast.error('Failed to delete opportunity')
    }
  }

  const resetForm = () => {
    setEditingOpportunity(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      campus: 'all',
      max_volunteers: '',
      requirements: '',
      contact_email: '',
      status: 'active',
    })
    setShowForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'completed':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (!showForm) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Volunteer Opportunities</h1>
            <p className="text-muted-foreground mt-1">Create and manage volunteer opportunities</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Opportunity
            </Button>
          </div>
        </div>

        {opportunities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No volunteer opportunities yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{opportunity.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{opportunity.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(opportunity)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(opportunity.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(opportunity.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{opportunity.start_time} - {opportunity.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{opportunity.contact_email}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline">{opportunity.campus}</Badge>
                      <Badge className={getStatusColor(opportunity.status)}>
                        {opportunity.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{opportunity.current_signups}</span>
                        <span className="text-muted-foreground">/ {opportunity.max_volunteers} volunteers</span>
                      </div>
                      {opportunity.current_signups >= opportunity.max_volunteers && (
                        <Badge variant="destructive">Full</Badge>
                      )}
                    </div>

                    {opportunity.requirements && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          <strong>Requirements:</strong> {opportunity.requirements}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
        </h1>
        <Button variant="outline" onClick={resetForm}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential opportunity details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Opportunity Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Book Fair Volunteer"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="description">Description *</Label>
                <AIContentHelper
                  onApply={(content) => handleInputChange('description', content)}
                  contentType="volunteer"
                  currentContent={formData.description}
                  context={{
                    title: formData.title,
                    campus: [formData.campus],
                  }}
                />
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what volunteers will do..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campus">Campus *</Label>
                <Select
                  value={formData.campus}
                  onValueChange={(value) => handleInputChange('campus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campuses</SelectItem>
                    <SelectItem value="preschool">Preschool</SelectItem>
                    <SelectItem value="elementary">Elementary</SelectItem>
                    <SelectItem value="middle-high">Middle & High School</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date, Time & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date, Time & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., School Library"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Volunteer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_volunteers">Maximum Volunteers *</Label>
                <Input
                  id="max_volunteers"
                  type="number"
                  min="1"
                  value={formData.max_volunteers}
                  onChange={(e) => handleInputChange('max_volunteers', e.target.value)}
                  placeholder="e.g., 10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="coordinator@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="requirements">Requirements/Skills Needed</Label>
                <AIContentHelper
                  onApply={(content) => handleInputChange('requirements', content)}
                  contentType="volunteer"
                  currentContent={formData.requirements}
                  context={{
                    title: formData.title,
                    description: formData.description,
                    campus: [formData.campus],
                  }}
                />
              </div>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Any special skills, certifications, or requirements..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
          </Button>
        </div>
      </form>
    </div>
  )
}

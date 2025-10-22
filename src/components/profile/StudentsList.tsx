'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Plus, Edit, Trash2, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

interface Student {
  id: string
  first_name: string
  last_name: string
  grade: string
  campus: string
  date_of_birth?: string
  allergies?: string
  medical_notes?: string
}

interface StudentsListProps {
  students: Student[]
  userId: string
}

const GRADE_OPTIONS = [
  'PreK', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th',
  '7th', '8th', '9th', '10th', '11th', '12th'
]

const CAMPUS_OPTIONS = [
  { value: 'preschool', label: 'Preschool' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'middle_high', label: 'Middle & High School' },
]

export default function StudentsList({ students, userId }: StudentsListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    campus: '',
    dateOfBirth: '',
    allergies: '',
    medicalNotes: '',
  })

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      grade: '',
      campus: '',
      dateOfBirth: '',
      allergies: '',
      medicalNotes: '',
    })
    setEditingStudent(null)
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.first_name,
      lastName: student.last_name,
      grade: student.grade,
      campus: student.campus,
      dateOfBirth: student.date_of_birth || '',
      allergies: student.allergies || '',
      medicalNotes: student.medical_notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/students', {
        method: editingStudent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          studentId: editingStudent?.id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(editingStudent ? 'Student updated!' : 'Student added!')
        setDialogOpen(false)
        resetForm()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to save student')
      }
    } catch (error) {
      console.error('Error saving student:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return

    try {
      const response = await fetch('/api/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Student removed')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to remove student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Students</CardTitle>
            <CardDescription>
              Manage your children's information for events and donations
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? 'Edit Student' : 'Add Student'}
                </DialogTitle>
                <DialogDescription>
                  {editingStudent
                    ? 'Update student information'
                    : 'Add a new student to your profile'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <Select
                      value={formData.grade}
                      onValueChange={(value) => setFormData({ ...formData, grade: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campus">Campus *</Label>
                    <Select
                      value={formData.campus}
                      onValueChange={(value) => setFormData({ ...formData, campus: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMPUS_OPTIONS.map((campus) => (
                          <SelectItem key={campus.value} value={campus.value}>
                            {campus.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth (optional)</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (optional)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="None"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalNotes">Medical Notes (optional)</Label>
                  <Textarea
                    id="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    placeholder="Any important medical information..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingStudent ? (
                      'Update Student'
                    ) : (
                      'Add Student'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {/* Students List */}
      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students added yet</h3>
              <p className="text-gray-600 mb-6">
                Add your children to personalize your experience and track donations
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Grade {student.grade} • {CAMPUS_OPTIONS.find(c => c.value === student.campus)?.label}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(student)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {(student.allergies || student.medical_notes) && (
                  <div className="space-y-2 text-sm">
                    {student.allergies && (
                      <p className="text-gray-600">
                        <span className="font-medium">Allergies:</span> {student.allergies}
                      </p>
                    )}
                    {student.medical_notes && (
                      <p className="text-gray-600">
                        <span className="font-medium">Medical:</span> {student.medical_notes}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Search, 
  Filter,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Voice } from '@/types'

export default function VoiceManagement() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [filterGender, setFilterGender] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingVoice, setEditingVoice] = useState<Voice | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    languageCode: 'en',
    languageName: 'English',
    gender: 'FEMALE',
    provider: 'puter',
    providerVoiceId: '',
    isPremium: false,
    isActive: true,
    sampleAudioUrl: ''
  })

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/voices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVoices(data.voices)
      }
    } catch (error) {
      console.error('Error fetching voices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateVoice = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/voices/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newVoice = await response.json()
        setVoices(prev => [...prev, newVoice.voice])
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating voice:', error)
    }
  }

  const handleUpdateVoice = async () => {
    if (!editingVoice) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/voices/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: editingVoice.id, ...formData })
      })

      if (response.ok) {
        const updatedVoice = await response.json()
        setVoices(prev => prev.map(v => v.id === updatedVoice.voice.id ? updatedVoice.voice : v))
        setEditingVoice(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating voice:', error)
    }
  }

  const handleDeleteVoice = async (voiceId: string) => {
    if (!confirm('Are you sure you want to delete this voice?')) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/voices/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voiceId })
      })

      if (response.ok) {
        setVoices(prev => prev.filter(v => v.id !== voiceId))
      }
    } catch (error) {
      console.error('Error deleting voice:', error)
    }
  }

  const handleToggleVoiceStatus = async (voiceId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/voices/toggle', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voiceId, isActive })
      })

      if (response.ok) {
        setVoices(prev => prev.map(v => v.id === voiceId ? { ...v, isActive } : v))
      }
    } catch (error) {
      console.error('Error toggling voice status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      languageCode: 'en',
      languageName: 'English',
      gender: 'FEMALE',
      provider: 'puter',
      providerVoiceId: '',
      isPremium: false,
      isActive: true,
      sampleAudioUrl: ''
    })
  }

  const openEditDialog = (voice: Voice) => {
    setEditingVoice(voice)
    setFormData({
      name: voice.name,
      displayName: voice.displayName,
      languageCode: voice.languageCode,
      languageName: voice.languageName,
      gender: voice.gender,
      provider: voice.provider,
      providerVoiceId: voice.providerVoiceId,
      isPremium: voice.isPremium,
      isActive: voice.isActive,
      sampleAudioUrl: voice.sampleAudioUrl || ''
    })
  }

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = filterLanguage === 'all' || voice.languageCode === filterLanguage
    const matchesGender = filterGender === 'all' || voice.gender === filterGender
    
    return matchesSearch && matchesLanguage && matchesGender
  })

  const languages = [...new Set(voices.map(v => v.languageCode))]
  const genders = [...new Set(voices.map(v => v.gender))]

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading voices...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Management</h2>
          <p className="text-muted-foreground">Manage TTS voices and language support</p>
        </div>
        <Dialog open={isCreateDialogOpen || editingVoice !== null} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setEditingVoice(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Voice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVoice ? 'Edit Voice' : 'Add New Voice'}
              </DialogTitle>
              <DialogDescription>
                Configure voice settings for TTS generation
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Voice ID</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., malayalam-female-1"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g., Priya"
                />
              </div>
              <div>
                <Label htmlFor="languageCode">Language Code</Label>
                <Select value={formData.languageCode} onValueChange={(value) => {
                  const languageName = value === 'ml' ? 'Malayalam' : 'English'
                  setFormData(prev => ({ ...prev, languageCode: value, languageName }))
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ml">Malayalam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="NEUTRAL">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="puter">Puter.js</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="providerVoiceId">Provider Voice ID</Label>
                <Input
                  id="providerVoiceId"
                  value={formData.providerVoiceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, providerVoiceId: e.target.value }))}
                  placeholder="Provider-specific voice ID"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="sampleAudioUrl">Sample Audio URL</Label>
                <Input
                  id="sampleAudioUrl"
                  value={formData.sampleAudioUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, sampleAudioUrl: e.target.value }))}
                  placeholder="https://example.com/sample.mp3"
                />
              </div>
              <div className="col-span-2 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPremium"
                    checked={formData.isPremium}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked }))}
                  />
                  <Label htmlFor="isPremium">Premium Voice</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                setEditingVoice(null)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button onClick={editingVoice ? handleUpdateVoice : handleCreateVoice}>
                {editingVoice ? 'Update Voice' : 'Create Voice'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search voices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Language</Label>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang === 'ml' ? 'Malayalam' : 'English'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {genders.map(gender => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Library ({filteredVoices.length} voices)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voice</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVoices.map((voice) => (
                <TableRow key={voice.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{voice.displayName}</div>
                      <div className="text-sm text-muted-foreground">{voice.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {voice.languageName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={voice.gender === 'FEMALE' ? 'default' : 'secondary'}>
                      {voice.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{voice.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    {voice.isPremium ? (
                      <Badge className="bg-yellow-500">Premium</Badge>
                    ) : (
                      <Badge variant="outline">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={voice.isActive}
                        onCheckedChange={(checked) => handleToggleVoiceStatus(voice.id, checked)}
                      />
                      <span className="text-sm">
                        {voice.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(voice)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {voice.sampleAudioUrl && (
                          <DropdownMenuItem>
                            <Play className="w-4 h-4 mr-2" />
                            Play Sample
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteVoice(voice.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
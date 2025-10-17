'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Calendar, Tag, ArrowLeft, Eye, Trash2, Edit2, Plus } from 'lucide-react'
import AIImageGenerator from '@/components/admin/AIImageGenerator'
import { AIContentHelper } from '@/components/ai/AIContentHelper'
import { SocialMediaPostComposer } from '@/components/social-media/SocialMediaPostComposer'
import Image from 'next/image'
import Link from 'next/link'
import { NewsPost } from '@/types/news.types'

export default function NewsAdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    campus: 'all' as 'preschool' | 'elementary' | 'middle-high' | 'all',
    featured_image_url: '',
    tags: [] as string[],
    published: false,
    publish_date: '',
  })

  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
      toast.error('Failed to load posts')
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Auto-generate slug from title
    if (field === 'title' && !editingPost) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleImageGenerated = (imageUrl: string) => {
    handleInputChange('featured_image_url', imageUrl)
    toast.success('Image added to post!')
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('You must be logged in to manage news')
        return
      }

      // Prepare post data
      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        campus: formData.campus,
        featured_image_url: formData.featured_image_url || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        published: formData.published,
        publish_date: formData.publish_date || new Date().toISOString(),
        author_id: user.id,
      }

      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('news_posts')
          .update(postData)
          .eq('id', editingPost.id)

        if (error) throw error
        toast.success('Post updated successfully!')
      } else {
        // Create new post
        const { error } = await supabase
          .from('news_posts')
          .insert([postData])

        if (error) throw error
        toast.success('Post created successfully!')
      }

      // Reset form and reload posts
      resetForm()
      loadPosts()
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      campus: post.campus as any,
      featured_image_url: post.featured_image_url || '',
      tags: post.tags || [],
      published: post.published || false,
      publish_date: post.publish_date ? post.publish_date.split('T')[0] : '',
    })
    setShowForm(true)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      toast.success('Post deleted successfully')
      loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const resetForm = () => {
    setEditingPost(null)
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      campus: 'all',
      featured_image_url: '',
      tags: [],
      published: false,
      publish_date: '',
    })
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage News</h1>
            <p className="text-muted-foreground mt-1">Create and manage news posts</p>
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
              Create New Post
            </Button>
          </div>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No news posts yet. Create your first post!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {post.featured_image_url && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.publish_date || post.created_at || '').toLocaleDateString()}
                        </span>
                        <Badge variant="outline">{post.campus}</Badge>
                        {post.tags && post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
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
          {editingPost ? 'Edit Post' : 'Create New Post'}
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
            <CardDescription>Essential post details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Post Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Spring Festival Recap"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="spring-festival-recap"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Will be used in the URL: /news/{formData.slug}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <AIContentHelper
                  onApply={(content) => handleInputChange('excerpt', content)}
                  contentType="news"
                  currentContent={formData.excerpt}
                  context={{
                    title: formData.title,
                    description: formData.content,
                    campus: [formData.campus],
                  }}
                />
              </div>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief summary of the post..."
                rows={2}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Content *</Label>
                <AIContentHelper
                  onApply={(content) => handleInputChange('content', content)}
                  contentType="news"
                  currentContent={formData.content}
                  context={{
                    title: formData.title,
                    description: formData.excerpt,
                    campus: [formData.campus],
                  }}
                />
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your post content here..."
                rows={10}
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
                <Label htmlFor="publish_date">Publish Date</Label>
                <Input
                  id="publish_date"
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => handleInputChange('publish_date', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Image Generator */}
        <AIImageGenerator
          title="Generate Featured Image"
          description="Use AI to create a custom featured image for this post"
          onImageGenerated={handleImageGenerated}
          defaultPrompt={`${formData.title}, professional blog post hero image, vibrant colors, school community theme`}
          category="news"
        />

        {/* Image Preview */}
        {formData.featured_image_url && (
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={formData.featured_image_url}
                  alt="Featured image"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => handleInputChange('featured_image_url', '')}
              >
                Remove Image
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </CardTitle>
            <CardDescription>Add tags to help organize posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag}
                    <span className="ml-2">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Publishing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Publish Post</Label>
                <p className="text-sm text-muted-foreground">
                  Make this post visible to the public
                </p>
              </div>
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) => handleInputChange('published', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Sharing */}
        {formData.published && (
          <Card>
            <CardHeader>
              <CardTitle>Share Post</CardTitle>
              <CardDescription>Share this news post on social media</CardDescription>
            </CardHeader>
            <CardContent>
              <SocialMediaPostComposer
                sourceContent={`${formData.title}\n\n${formData.excerpt || formData.content}`}
                sourceTitle={formData.title}
                sourceImage={formData.featured_image_url}
                onPost={(result) => {
                  if (result.success) {
                    toast.success(`Post shared to ${result.platforms.join(' and ')}!`)
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </form>
    </div>
  )
}

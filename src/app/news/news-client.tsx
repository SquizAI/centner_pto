'use client'

import { useState, useMemo } from 'react'
import { NewsFeatured, NewsGrid, NewsFilter } from '@/components/news'
import { NewsPost, Campus } from '@/types/news.types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface NewsClientProps {
  posts: NewsPost[]
}

const POSTS_PER_PAGE = 9

export function NewsClient({ posts }: NewsClientProps) {
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Featured post (always the first post)
  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)

  // Filter posts based on search and campus
  const filteredPosts = useMemo(() => {
    let filtered = remainingPosts

    // Filter by campus
    if (selectedCampus && selectedCampus !== 'all') {
      filtered = filtered.filter((post) => post.campus === selectedCampus)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [remainingPosts, selectedCampus, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleCampusChange = (campus: Campus | null) => {
    setSelectedCampus(campus)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Featured Post */}
      {featuredPost && !searchQuery && !selectedCampus && (
        <section className="mb-16">
          <NewsFeatured post={featuredPost} />
        </section>
      )}

      {/* Filters */}
      <section className="mb-12">
        <NewsFilter
          selectedCampus={selectedCampus}
          onCampusChange={handleCampusChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      </section>

      {/* Posts Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            {searchQuery || selectedCampus ? 'Filtered Results' : 'Latest Updates'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of{' '}
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>

        {paginatedPosts.length > 0 ? (
          <NewsGrid posts={paginatedPosts} columns={3} />
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-lg mb-2">No posts found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentPage(page)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type GalleryPhoto = {
  id: string
  project_name: string
  before_photo_url: string | null
  after_photo_url: string | null
  description: string | null
  category: 'residential' | 'commercial'
  featured: boolean
  display_order: number | null
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'residential' | 'commercial'>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [showingBefore, setShowingBefore] = useState(true)

  const fetchPhotos = useCallback(async () => {
    try {
      if (!supabase) {
        // If Supabase is not configured, show sample photos
        setPhotos(getSamplePhotos())
      } else {
        const { data, error } = await supabase
          .from('gallery_photos')
          .select('*')
          .order('display_order', { ascending: true })

        if (error) throw error
        setPhotos(data || [])
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
      // For demo, let's show some sample photos
      setPhotos(getSamplePhotos())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const getSamplePhotos = (): GalleryPhoto[] => [
    {
      id: '1',
      project_name: 'Kitchen Electrical Upgrade',
      before_photo_url: '/images/kitchen-before.jpg',
      after_photo_url: '/images/kitchen-after.jpg',
      description: 'Complete electrical rewiring and new outlet installation for modern kitchen',
      category: 'residential',
      featured: true,
      display_order: 1
    },
    {
      id: '2',
      project_name: 'Panel Upgrade - Burlington Home',
      before_photo_url: '/images/panel-before.jpg',
      after_photo_url: '/images/panel-after.jpg',
      description: 'Upgraded from 100A to 200A service panel with modern safety features',
      category: 'residential',
      featured: true,
      display_order: 2
    },
    {
      id: '3',
      project_name: 'Restaurant Lighting Installation',
      before_photo_url: '/images/restaurant-before.jpg',
      after_photo_url: '/images/restaurant-after.jpg',
      description: 'Commercial lighting design and installation for local restaurant',
      category: 'commercial',
      featured: false,
      display_order: 3
    },
    {
      id: '4',
      project_name: 'EV Charger Installation',
      before_photo_url: '/images/garage-before.jpg',
      after_photo_url: '/images/garage-after.jpg',
      description: 'Level 2 EV charger installation with dedicated 240V circuit',
      category: 'residential',
      featured: false,
      display_order: 4
    },
    {
      id: '5',
      project_name: 'Office Building Rewire',
      before_photo_url: '/images/office-before.jpg',
      after_photo_url: '/images/office-after.jpg',
      description: 'Complete electrical system upgrade for 3-story office building',
      category: 'commercial',
      featured: true,
      display_order: 5
    },
    {
      id: '6',
      project_name: 'Outdoor Lighting System',
      before_photo_url: '/images/outdoor-before.jpg',
      after_photo_url: '/images/outdoor-after.jpg',
      description: 'Landscape and security lighting installation',
      category: 'residential',
      featured: false,
      display_order: 6
    }
  ]

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory)

  const openLightbox = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo)
    setShowingBefore(true)
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return
    
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id)
    let newIndex
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1
    } else {
      newIndex = currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0
    }
    
    setSelectedPhoto(filteredPhotos[newIndex])
    setShowingBefore(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Work</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse through our portfolio of completed electrical projects across Northern and Central Vermont. 
            Every project showcases our commitment to quality and safety.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setSelectedCategory('residential')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'residential'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Residential
            </button>
            <button
              onClick={() => setSelectedCategory('commercial')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'commercial'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Commercial
            </button>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => openLightbox(photo)}
            >
              <div className="relative h-64">
                {photo.after_photo_url ? (
                  <div className="relative h-full">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">After</span>
                    </div>
                    {photo.featured && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{photo.project_name}</h3>
                {photo.description && (
                  <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {photo.category}
                  </span>
                  {photo.before_photo_url && photo.after_photo_url && (
                    <span className="text-xs text-gray-500">Before & After</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects found in this category.</p>
          </div>
        )}

        {/* Lightbox */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <div className="max-w-4xl w-full">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="relative h-96 md:h-[500px]">
                  {selectedPhoto.before_photo_url && selectedPhoto.after_photo_url ? (
                    <div className="h-full relative">
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <button
                          onClick={() => setShowingBefore(true)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            showingBefore
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Before
                        </button>
                        <button
                          onClick={() => setShowingBefore(false)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            !showingBefore
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          After
                        </button>
                      </div>
                      <div className="h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">
                          {showingBefore ? 'Before' : 'After'} Photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedPhoto.project_name}
                  </h2>
                  {selectedPhoto.description && (
                    <p className="text-gray-600 mb-4">{selectedPhoto.description}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {selectedPhoto.category}
                    </span>
                    {selectedPhoto.featured && (
                      <span className="text-sm text-gray-500">Featured Project</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
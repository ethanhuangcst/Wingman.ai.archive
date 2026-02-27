"use client";

import React, { useState, useRef, useEffect } from 'react';

// Simple icons page displaying only the icons we have in our Resources folder
export default function IconsPage() {
  const localIcons = [
    { name: 'icon_send.gif', alt: 'Send Icon (GIF)' },
    { name: 'icon_send.png', alt: 'Send Icon (PNG)' },
    { name: 'icon_update.gif', alt: 'Update Icon (GIF)' },
    { name: 'icon_update.png', alt: 'Update Icon (PNG)' },
    { name: 'icon_upload.gif', alt: 'Upload Icon (GIF)' },
    { name: 'icon_upload.png', alt: 'Upload Icon (PNG)' },
    { name: 'comment-1-share.svg', alt: 'Share Icon (SVG)' },
    { name: 'show.svg', alt: 'Show Password Icon (SVG)' },
    { name: 'hidden.svg', alt: 'Hide Password Icon (SVG)' },
  ];

  // Create test data: test text #1 - test text #15
  const testItems = Array.from({ length: 15 }, (_, i) => `test text #${i + 1}`);

  // Example 1: Horizontal Scroll View State
  const scrollViewRef = useRef<HTMLDivElement>(null);

  // Example 2: CSS Snap Scroll State
  const snapScrollRef = useRef<HTMLDivElement>(null);

  // Example 3: Infinite Carousel State
  const [infiniteCarouselIndex, setInfiniteCarouselIndex] = useState(0);
  const infiniteItemsPerPage = 3;

  const handleInfinitePrev = () => {
    setInfiniteCarouselIndex(prev => {
      if (prev === 0) {
        return Math.ceil(testItems.length / infiniteItemsPerPage) - 1;
      }
      return prev - 1;
    });
  };

  const handleInfiniteNext = () => {
    setInfiniteCarouselIndex(prev => {
      if (prev === Math.ceil(testItems.length / infiniteItemsPerPage) - 1) {
        return 0;
      }
      return prev + 1;
    });
  };

  const getInfiniteItems = () => {
    const start = infiniteCarouselIndex * infiniteItemsPerPage;
    return testItems.slice(start, start + infiniteItemsPerPage);
  };

  // Example 4: Tabbed Interface State
  const [activeTab, setActiveTab] = useState(0);
  const tabItems = testItems.slice(0, 5); // Using first 5 items for tabs

  // Example 5: Snap Pager State
  const [snapPagerIndex, setSnapPagerIndex] = useState(0);
  const snapPagerItemsPerPage = 3;

  const handleSnapPagerPrev = () => {
    setSnapPagerIndex(prev => Math.max(0, prev - 1));
  };

  const handleSnapPagerNext = () => {
    setSnapPagerIndex(prev => Math.min(Math.ceil(testItems.length / snapPagerItemsPerPage) - 1, prev + 1));
  };

  const getSnapPagerItems = () => {
    const start = snapPagerIndex * snapPagerItemsPerPage;
    return testItems.slice(start, start + snapPagerItemsPerPage);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Icons</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localIcons.map((icon, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center">
              <img 
                src={`/Resources/${icon.name}`} 
                alt={icon.alt} 
                className="w-16 h-16 mb-4 object-contain"
              />
              <div className="text-center">
                <p className="font-medium text-gray-900">{icon.alt}</p>
                <p className="text-sm text-gray-500 mt-1">{icon.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Example 1: Horizontal Scroll View */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Horizontal Scroll View</h2>
          <p className="text-sm text-gray-600 mb-4">
            A simple horizontal scrollable container with native scrolling behavior. Users can scroll left/right with mouse or touch.
          </p>
          <div className="relative w-full">
            <div 
              ref={scrollViewRef}
              className="flex overflow-x-auto space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
              style={{ scrollbarWidth: 'thin' }}
            >
              {testItems.map((item, index) => (
                <div key={index} className="flex-shrink-0 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">How to use:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`<div className="flex overflow-x-auto space-x-3 p-4">
  {items.map((item, index) => (
    <div key={index} className="flex-shrink-0">
      {item}
    </div>
  ))}
</div>`}
            </pre>
          </div>
        </div>

        {/* Example 2: CSS Snap Scroll Container */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. CSS Snap Scroll Container</h2>
          <p className="text-sm text-gray-600 mb-4">
            Uses CSS scroll-snap-type to create a pager-like effect where scrolling snaps to each item.
          </p>
          <div className="relative w-full">
            <div 
              ref={snapScrollRef}
              className="flex overflow-x-auto space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
              style={{ 
                scrollbarWidth: 'thin',
                scrollSnapType: 'x mandatory'
              }}
            >
              {testItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                  style={{ scrollSnapAlign: 'start', minWidth: '120px' }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">How to use:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`<div className="flex overflow-x-auto" style={{ scrollSnapType: 'x mandatory' }}>
  {items.map((item, index) => (
    <div 
      key={index} 
      className="flex-shrink-0"
      style={{ scrollSnapAlign: 'start', minWidth: '120px' }}
    >
      {item}
    </div>
  ))}
</div>`}
            </pre>
          </div>
        </div>

        {/* Example 3: Infinite Carousel */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Infinite Carousel</h2>
          <p className="text-sm text-gray-600 mb-4">
            A carousel that wraps around continuously, allowing infinite scrolling in either direction.
          </p>
          <div className="relative w-full">
            <button 
              onClick={handleInfinitePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white text-gray-700 rounded-full shadow flex items-center justify-center z-10 hover:bg-gray-100"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex overflow-hidden px-8">
              <div className="flex space-x-3 p-4">
                {getInfiniteItems().map((item, index) => (
                  <div key={index} className="flex-shrink-0 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm min-w-[100px]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleInfiniteNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white text-gray-700 rounded-full shadow flex items-center justify-center z-10 hover:bg-gray-100"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">How to use:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`const [currentIndex, setCurrentIndex] = useState(0);
const itemsPerPage = 3;

const handlePrev = () => {
  setCurrentIndex(prev => {
    if (prev === 0) {
      return Math.ceil(items.length / itemsPerPage) - 1;
    }
    return prev - 1;
  });
};

const handleNext = () => {
  setCurrentIndex(prev => {
    if (prev === Math.ceil(items.length / itemsPerPage) - 1) {
      return 0;
    }
    return prev + 1;
  });
};

const visibleItems = items.slice(
  currentIndex * itemsPerPage,
  currentIndex * itemsPerPage + itemsPerPage
);`}
            </pre>
          </div>
        </div>

        {/* Example 4: Tabbed Interface with Swipe */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Tabbed Interface with Swipe</h2>
          <p className="text-sm text-gray-600 mb-4">
            Horizontal tabs that can be both clicked and swiped between (swipe functionality requires touch device).
          </p>
          <div className="relative w-full">
            <div className="flex overflow-x-auto space-x-1 p-2 bg-gray-100 rounded-lg border border-gray-200">
              {tabItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${activeTab === index ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700">Active tab content: {tabItems[activeTab]}</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">How to use:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`const [activeTab, setActiveTab] = useState(0);

<div className="flex overflow-x-auto space-x-1">
  {tabs.map((tab, index) => (
    <button
      key={index}
      onClick={() => setActiveTab(index)}
      className={activeTab === index ? 'active-tab' : 'inactive-tab'}
    >
      {tab}
    </button>
  ))}
</div>

<div className="tab-content">
  {tabs[activeTab]}
</div>`}
            </pre>
          </div>
        </div>

        {/* Example 5: Snap Pager */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Snap Pager</h2>
          <p className="text-sm text-gray-600 mb-4">
            Combines scroll snapping with visible pagination indicators for clear navigation context.
          </p>
          <div className="relative w-full">
            <button 
              onClick={handleSnapPagerPrev}
              disabled={snapPagerIndex === 0}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white text-gray-700 rounded-full shadow flex items-center justify-center z-10 ${snapPagerIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex overflow-x-auto space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 px-8"
              style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'thin' }}
            >
              {getSnapPagerItems().map((item, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                  style={{ scrollSnapAlign: 'start', minWidth: '100px' }}
                >
                  {item}
                </div>
              ))}
            </div>

            <button 
              onClick={handleSnapPagerNext}
              disabled={snapPagerIndex >= Math.ceil(testItems.length / snapPagerItemsPerPage) - 1}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white text-gray-700 rounded-full shadow flex items-center justify-center z-10 ${snapPagerIndex >= Math.ceil(testItems.length / snapPagerItemsPerPage) - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: Math.ceil(testItems.length / snapPagerItemsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setSnapPagerIndex(index)}
                className={`w-3 h-3 rounded-full ${index === snapPagerIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">How to use:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`const [currentPage, setCurrentPage] = useState(0);
const itemsPerPage = 3;

// Navigation functions
const handlePrev = () => setCurrentPage(prev => Math.max(0, prev - 1));
const handleNext = () => setCurrentPage(prev => Math.min(Math.ceil(items.length / itemsPerPage) - 1, prev + 1));

// Get items for current page
const pageItems = items.slice(
  currentPage * itemsPerPage,
  currentPage * itemsPerPage + itemsPerPage
);`}
            </pre>
          </div>
        </div>

        {/* Example: Share Icon with Disabled Mode */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Icon - Disabled Mode Example</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Enabled State */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                <img 
                  src="/Resources/comment-1-share.svg" 
                  alt="Share Icon (Enabled)" 
                  className="w-10 h-10"
                />
              </div>
              <p className="font-medium text-gray-700">Enabled State</p>
              <p className="text-sm text-gray-500">Normal appearance</p>
            </div>

            {/* Disabled State */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                <img 
                  src="/Resources/comment-1-share.svg" 
                  alt="Share Icon (Disabled)" 
                  className="w-10 h-10 opacity-40" 
                />
              </div>
              <p className="font-medium text-gray-700">Disabled State</p>
              <p className="text-sm text-gray-500">Using CSS opacity: 0.4</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2">How to use in code:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {`<button className="${'{'}'disabled ? 'opacity-40 cursor-not-allowed' : ''${'}'}">
  <img src="/Resources/comment-1-share.svg" alt="Share" className="w-6 h-6" />
</button>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

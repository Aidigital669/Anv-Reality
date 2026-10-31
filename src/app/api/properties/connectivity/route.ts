import { NextRequest, NextResponse } from 'next/server';
import {
  findNearestLandmarks,
  resolveCoordinates,
  LandmarkCategory,
  formatConnectivityBulletPoints
} from '@/lib/geo-landmarks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locality = searchParams.get('locality') || undefined;
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius') || '5.0';
    const category = (searchParams.get('category') as LandmarkCategory | 'all') || 'all';

    const lat = latStr ? parseFloat(latStr) : undefined;
    const lng = lngStr ? parseFloat(lngStr) : undefined;
    let radius = parseFloat(radiusStr);
    if (isNaN(radius) || radius <= 0) radius = 5.0;
    // Cap radius between 1km and 25km
    radius = Math.max(1.0, Math.min(25.0, radius));

    const originCoords = resolveCoordinates(locality, lat, lng);

    if (!originCoords) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not resolve coordinates for the provided locality or GPS position.',
          locality: locality || null,
          landmarks: []
        },
        { status: 400 }
      );
    }

    const landmarks = findNearestLandmarks(
      { locality, lat: originCoords.lat, lng: originCoords.lng },
      radius,
      category
    );

    const bullets = formatConnectivityBulletPoints(
      { locality, lat: originCoords.lat, lng: originCoords.lng },
      5
    );

    return NextResponse.json({
      success: true,
      locality: locality || 'Pune',
      coordinates: originCoords,
      radiusKm: radius,
      totalFound: landmarks.length,
      landmarks,
      suggestedBulletPoints: bullets
    });
  } catch (err: any) {
    console.error('Error computing 5km connectivity:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal server error calculating connectivity'
      },
      { status: 500 }
    );
  }
}


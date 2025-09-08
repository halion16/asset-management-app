'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getLocations, getAssets, initializeStorage } from "@/lib/storage";
import { Location, Asset } from "@/data/mockData";
import { 
  Plus,
  MapPin,
  Package,
  User,
  Building
} from "lucide-react";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    initializeStorage();
    loadData();
  }, []);

  const loadData = () => {
    const locationsData = getLocations();
    const assetsData = getAssets();
    setLocations(locationsData);
    setAssets(assetsData);
  };

  const getAssetsByLocation = (locationName: string) => {
    return assets.filter(asset => asset.location === locationName);
  };

  const getLocationStats = (locationName: string) => {
    const locationAssets = getAssetsByLocation(locationName);
    return {
      total: locationAssets.length,
      operational: locationAssets.filter(a => a.status === 'operational').length,
      maintenance: locationAssets.filter(a => a.status === 'maintenance').length,
      down: locationAssets.filter(a => a.status === 'down').length,
      totalValue: locationAssets.reduce((sum, asset) => sum + asset.value, 0)
    };
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ubicazioni</h1>
            <p className="text-gray-600">Gestisci le sedi aziendali e i loro asset</p>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            disabled
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuova Ubicazione
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                <p className="text-sm text-gray-600">Sedi Totali</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
                <p className="text-sm text-gray-600">Asset Totali</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                <p className="text-sm text-gray-600">Manager Attivi</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold text-xs">€</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(assets.reduce((sum, asset) => sum + asset.value, 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">Valore Complessivo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => {
            const stats = getLocationStats(location.name);
            
            return (
              <Card key={location.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        {location.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Manager */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {location.manager.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{location.manager}</p>
                      <p className="text-xs text-gray-500">Responsabile</p>
                    </div>
                  </div>

                  {/* Asset Summary */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Asset Totali</span>
                      <span className="font-semibold text-gray-900">{stats.total}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-700">{stats.operational}</div>
                        <div className="text-green-600">Operativi</div>
                      </div>
                      
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="font-semibold text-orange-700">{stats.maintenance}</div>
                        <div className="text-orange-600">Manutenzione</div>
                      </div>
                      
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="font-semibold text-red-700">{stats.down}</div>
                        <div className="text-red-600">Fermi</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Valore Asset</span>
                      <span className="font-semibold text-gray-900">
                        €{stats.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Recent Assets */}
                  {stats.total > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Asset principali:</p>
                      <div className="space-y-1">
                        {getAssetsByLocation(location.name).slice(0, 2).map(asset => (
                          <div key={asset.id} className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700 truncate">{asset.name}</span>
                            <span className={`ml-auto px-1 py-0.5 rounded text-xs ${
                              asset.status === 'operational' ? 'bg-green-100 text-green-700' :
                              asset.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {asset.status === 'operational' ? 'OK' : 
                               asset.status === 'maintenance' ? 'MAINT' : 'DOWN'}
                            </span>
                          </div>
                        ))}
                        {stats.total > 2 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{stats.total - 2} altri asset
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {locations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessuna ubicazione presente
            </h3>
            <p className="text-gray-500 mb-4">
              Le ubicazioni aziendali appariranno qui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
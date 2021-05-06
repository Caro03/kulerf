import {Formatter} from "../utils/formater";
import {Helper} from "../utils/helper";
import {ArrayPrototypes} from "../utils/prototypes/array.prototypes";
ArrayPrototypes.activateFrom();
export class MapsComponent {
    private mapElement;
    private map;
    private markers = [];
    private points;
    constructor() {
        this.mapElement = document.getElementById("map-canvas");
        if (this.mapElement !== null) {
            if (typeof google === "undefined" || !google.hasOwnProperty("maps")) {
                const mapsApiUrl = "https://maps.googleapis.com/maps/api/js";
                const mapsApiParams = {
                    v: "3.exp",
                    key: process.env.GOOGLE_MAP_KEY,
                };
                const script = document.createElement("script");
                script.type = "text/javascript";
                script.src = mapsApiUrl + "?" + Formatter.serialize(mapsApiParams);
                script.addEventListener("load", () => {
                    this.initMap();
                });
                document.body.appendChild(script);
            } else {
                this.initMap();
            }
        }
    }
    private initMap() {
        const mapOptions = {
            zoomControl: true,
            scaleControl: false,
            streetViewControl: true,
            rotateControl: false,
            fullscreenControl: false,
            scrollwheel: false,
            mapTypeControl: true,
            center: {lat: -34.397, lng: 150.644},
            zoom: 4,
            styles: [
                {
                    featureType: "water",
                    elementType: "geometry.fill",
                    stylers: [{color: "#d3d3d3"}],
                },
                {
                    featureType: "transit",
                    stylers: [{color: "#808080"}, {visibility: "off"}],
                },
                {
                    featureType: "road.highway",
                    elementType: "geometry.stroke",
                    stylers: [{visibility: "on"}, {color: "#b3b3b3"}],
                },
                {
                    featureType: "road.highway",
                    elementType: "geometry.fill",
                    stylers: [{color: "#ffffff"}],
                },
                {
                    featureType: "road.local",
                    elementType: "geometry.fill",
                    stylers: [
                        {visibility: "on"},
                        {color: "#ffffff"},
                        {weight: 1.8},
                    ],
                },
                {
                    featureType: "road.local",
                    elementType: "geometry.stroke",
                    stylers: [{color: "#d7d7d7"}],
                },
                {
                    featureType: "poi",
                    elementType: "geometry.fill",
                    stylers: [{visibility: "on"}, {color: "#ebebeb"}],
                },
                {
                    featureType: "administrative",
                    elementType: "geometry",
                    stylers: [{color: "#a7a7a7"}],
                },
                {
                    featureType: "road.arterial",
                    elementType: "geometry.fill",
                    stylers: [{color: "#ffffff"}],
                },
                {
                    featureType: "road.arterial",
                    elementType: "geometry.fill",
                    stylers: [{color: "#ffffff"}],
                },
                {
                    featureType: "landscape",
                    elementType: "geometry.fill",
                    stylers: [{visibility: "on"}, {color: "#efefef"}],
                },
                {
                    featureType: "road",
                    elementType: "labels.text.fill",
                    stylers: [{color: "#696969"}],
                },
                {
                    featureType: "administrative",
                    elementType: "labels.text.fill",
                    stylers: [{visibility: "on"}, {color: "#737373"}],
                },
                {
                    featureType: "poi",
                    elementType: "labels.icon",
                    stylers: [{visibility: "off"}],
                },
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{visibility: "off"}],
                },
                {
                    featureType: "road.arterial",
                    elementType: "geometry.stroke",
                    stylers: [{color: "#d6d6d6"}],
                },
                {
                    featureType: "road",
                    elementType: "labels.icon",
                    stylers: [{visibility: "off"}],
                },
                {},
                {
                    featureType: "poi",
                    elementType: "geometry.fill",
                    stylers: [{color: "#dadada"}],
                },
            ],
        };
        this.map = new google.maps.Map(this.mapElement, Helper.extend(mapOptions));
        this.map.active_window = false;
        this.points = JSON.parse(this.mapElement.dataset.pointsObj);
        if (this.points) {
            this.renderPoints();
        }
    }
    private renderPoints() {
        const _self = this;
        const bounds = new google.maps.LatLngBounds();
        this.map.setOptions();
        let marker;
        for (var index in this.points) {
            const point = this.points[index];
            const latLng = new google.maps.LatLng(point.lat, point.lng);
            var markerUrl = point.marker.toString();
            if (markerUrl.indexOf("https://") != -1) {
                marker = new google.maps.Marker({
                    position: latLng,
                    map: this.map,
                    icon: point.marker,
                });
            } else {
                marker = new google.maps.Marker({
                    position: latLng,
                    map: this.map,
                    icon: process.env.PRIMARY_SITE_URL + "/img/" + point.marker,
                });
            }
            // marker.image = point.image;
            marker.type = point.type;
            marker.params = [point.image, point.title, point.params];
            marker.id = index;
            this.markers.push(marker);
            bounds.extend(latLng);
            if (document.querySelector(`#template-marker`)) {
                google.maps.event.addListener(
                    marker,
                    "click",
                    this.showInfoWindow.bind(this, marker)
                );
            }
        }
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
            bounds.extend(
                new google.maps.LatLng(
                    bounds.getNorthEast().lat() + 0.01,
                    bounds.getNorthEast().lng() + 0.01
                )
            );
            bounds.extend(
                new google.maps.LatLng(
                    bounds.getSouthWest().lat() - 0.01,
                    bounds.getSouthWest().lng() - 0.01
                )
            );
        }
        this.map.fitBounds(bounds);
        this.map.setZoom(this.map.getZoom() - 1);
        google.maps.event.addDomListener(
            window,
            "resize",
            Helper.debounce(function () {
                _self.map.fitBounds(bounds);
            })
        );
    }
    private showInfoWindow(marker) {
        const infoWindow = new google.maps.InfoWindow();
        this.closeAllMarkers();
        const template = document.querySelector(
            `#template-marker`
        );
        if (template) {
          console.log('test');
            infoWindow.setContent(
                Formatter.sprintf(template.innerHTML, [marker.params])
            );
            infoWindow.open(this.map, marker);
            this.map.active_window = {infoWindow: infoWindow, marker: marker};
        }
    }
    private closeAllMarkers() {
        if (this.map.active_window != false) {
            this.map.active_window.infoWindow.close(
                this.map,
                this.map.active_window.marker
            );
        }
    }
}

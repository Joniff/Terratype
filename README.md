# README #

### Purpose ###
Google map datatype for Umbraco V7 

### Why? ###
Wish to give your content editors easy Google Maps to set real world locations. 
 
### Usage ###
1. Install package via Nuget or Umbraco Package Installer
2. Create a new data type using the new Angular Google Maps property editor 
3. Add new data type to document type
4. Create new content based on document type

Options
a. API Key
   (Now a requirment to use Google Maps
    https://developers.google.com/maps/documentation/javascript/
    get-api-key#get-an-api-key)
b. Coordinate System; Choose between WGS-84 which is the international standard or
    GCJ-02 which is requirment to comply with Chinese state law
c. Show Search Box - Decide whether to display a Search box to content editor
d. Search box country filter - Restrict search results from one country you pick from a
    dropdown list 
e. Default location – set a default location for map
f. Map Height – Set the height of the Google map in pixels
g. Hide Label – Decide whether the Map takes up all the space of the editor    
h. Hide, show or allow the selected coordinates to be displayed and / or editable
i. Marker Icon - Select an image to use as the map marker
   Can select either from a predefined list or
   any custom image  
j. Format: Choose the format you wish to store your map coordinates
   Csv = "latitude,longitude,zoom"
   Json = Json object in format
   Csv with Search: "latitude,longitude,zoom,icon image,icon shadow image,icon width,
                     icon height, horizontal anchor, vertical anchor, format,apikey,
                     coordinate system,search status,search limit,search typed by user"
j. Reduce watches - Only enable if you know what you are doing
 

###Spec###
The package contains a single dll installed in the Umbraco /bin/ folder and a collection of css, html & js files stored within the /App_Plugins/AngularGoogleMaps/2.0.2/ folder. The new data type is of type string in the format latitude,longitude,zoom. If google maps is unable to load, for internet issues for example, then the map will downgrade to a coordinate editor instead, this is by design to allow off net use.
 
###Type Convertor###
Dynamic convertor works straight out of the box now, converts property string to AngularGoogleMaps.Model type which contains 3 properties (Latitude, Longitude and Zoom)
 
In a razor page with an AGM property named Map
@{
  var lat = CurrentPage.Map.Latitude;
  var lng = CurrentPage.Map.Longitude;
  var zoom = CurrentPage.Map.Zoom;

// Only works if format is Json or Csv with Search
  var searchtyped = CurrentPage.Map.SearchTyped;
}
 
Strongly Typed convertor converts any AGM PropertyValue to AngularGoogleMaps.Model
 
In a razor page with an AGM property with alias map
@{
  var map = Model.Content.GetPropertyValue<AngularGoogleMaps.Model>("map");
  var lat = map.Latitude;
  var lng = map.Longitude;
  var zoom = map.Zoom;

// Only works if format is Json or Csv with Search
  var searchtyped = map.SearchType;
}
 
NOTE: You may need to restart IIS before the Google Map will show for first time.
 
### Spec ###
The package contains a single dll installed in the Umbraco /bin/ folder and a collection of css, html & js files stored within the /App_Plugins/AngularGoogleMaps/2.0.0/ folder. The new data type is of type string in the format latitude,longitude,zoom. If google maps is unable to load, for internet issues for example, then the map will downgrade to a coordinate editor instead, this is by design to allow off net use.
 
Type Convertor
Dynamic convertor works straight out of the box now, converts property string to AngularGoogleMaps.Model type which contains 3 properties (Latitude, Longitude and Zoom)

In a razor page with an AGM property named Map
@{
	var lat = CurrentPage.Map.Latitude;
	var lng = CurrentPage.Map.Longitude;
	var zoom = CurrentPage.Map.Zoom;
}

Strongly Typed convertor converts any AGM PropertyValue to AngularGoogleMaps.Model

In a razor page with an AGM property with alias map
@{
	var map = Model.Content.GetPropertyValue<AngularGoogleMaps.Model>("map");
	var lat = map.Latitude;
	var lng = map.Longitude;
	var zoom = map.Zoom;
}

 
### Log ###

**2.0.3**
Fixed error when typing coordinates

**2.0.2**

Added icon, definition and search typed in by content editors to AngularGoogleMaps.Model

**2.0.1**

Allow empty API Key to be set, for sites that still accept no API key


**2.0.0**
 
Preview mode for setting section

Added extra default icons

Can now use relative icon urls

 
**1.0.9**

Removed reliance on Angular Google Map Library - This was causing endless headache

Added API key (Which now is a requirment for all new Google Maps)

Added Coordinate System

Added reduce watch mode, for those using AGM in very large multiple fieldset controls

 
 
**1.0.8**
Stopped dependancy on Archetype
Can now set size and anchor point for custom marker
Removed long list of pre-defined markers (New pre-defined markers will appear in next version), for now can only create custom markers
 
**1.0.7**
Use InvariantCulture for decimal convertors
 
**1.0.6**
Added Google Map to data type to make it easier to pick default location
NuGet package (https://www.nuget.org/packages/AngularGoogleMaps)
IPropertyValueConverter and StronglyTyped Convertor to convert string property value to Lat, Long, Zoom easily
 
**1.0.5**
Updated to latest http://angular-google-maps.org 2.1.X library 
Can now select marker icon to use
Removed excess watches for improved performance
 
**1.0.4**
Can now be used within an Archetype.
Have added Google API KEY for heavy users with more than 25 000 map request per day 
Need to amend line 2 of /App_Plugins/AngularGoogleMaps/1.0.4/controller.js if you require this functionality.

**1.0.3**
Have removed internal resources from dll, now uses standard js, css & html files stored in /App_Plugins/AngularGoogleMaps/1.0.3 folder
 
**1.0.2**
Have removed usage of 'draggable' attribute, to stop clash with uSkySlider
 
**1.0.1**
Extra refresh if map is not on first tab on content
Fixed error with release mode, eg. web.config not in debug mode


### Source code ###

Download the source code, it should work for Visual Studio 2013 & 2015. If you set **AngularGoogleMaps.TestSite** as your **Set as Startup project** this should execute the test Umbraco website, where you can test AGM under different scenarios. Once running, surf to http://localhost:60389/umbraco and at the login type **admin** for user and **password** for password.
 
![AGM inside Nested Content.png](https://bitbucket.org/repo/nrrnBg/images/2343101569-AGM%20inside%20Nested%20Content.png)
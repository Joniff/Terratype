# README #

### Purpose ###
Map datatype for Umbraco V7 

### Why? ###
Wish to give your content editors easy Maps to set real world locations. 
 
### Usage ###
1. Install package via Nuget or Umbraco Package Installer
2. Create a new data type using the new Terratype property editor 
3. Add new data type to document type
4. Create new content based on document type

###Spec###
The package contains a single dll installed in the Umbraco /bin/ folder and a collection of css, html & js files stored within the /App_Plugins/Terratype/1.0.0/ folder. The new data type is of Json encoded string format
 
###Type Convertor###
Dynamic convertor works straight out of the box now, converts property string to Terratype.Model type
 
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

**1.0.0**
	Complete rewrite based from AngularGoogleMaps

### Source code ###

Download the source code, it should work for Visual Studio 2013 & 2015. If you set **Terratype.TestSite** as your **Set as Startup project** this should execute the test Umbraco website, where you can test maps under different scenarios. Once running, surf to http://localhost:60389/umbraco and at the login type **admin** for user and **password** for password.
 

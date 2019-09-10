using System;
using System.Globalization;
using System.Threading;
using System.Web;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Newtonsoft.Json;
using Terratype.CoordinateSystems;
using Terratype.Icons;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Composing;
using Umbraco.Core.Configuration;
using Umbraco.Core.IO;
using Umbraco.Core.Logging;

//  Given When Then

namespace Terratype.Test.Models
{
	[TestClass]
	public class Json
	{
		private string[] Cultures = new string[]
		{
			"",
			"en-US",
			"en-GB",
			"ar-EG",
			"ar-SA",
			"zh-CN",
			"hr-HR",
			"cs-CZ",
			"da-DK",
			"nl-NL",
			"fa-IR",
			"fi-FI",
			"fr-FR",
			"de-DE",
			"el-GR",
			"gu-IN",
			"hi-IN",
			"hu-HU",
			"it-IT",
			"ja-JP",
			"ko-KR",
			"pl-PL",
			"es-ES",
			"tr-TR",
			"vi-VN"
		};

		private Random rnd = new Random();

		private Composition Composition()
		{
			var logger = Mock.Of<ILogger>();
			var profiler = Mock.Of<IProfiler>();
			var proflogger = new ProfilingLogger(logger, profiler);
			var appCaches = AppCaches.Disabled;
			var globalSettings = Mock.Of<IGlobalSettings>(
				settings =>
					settings.ConfigurationStatus == UmbracoVersion.SemanticVersion.ToSemanticString() &&
					settings.UseHttps == false &&
					settings.HideTopLevelNodeFromPath == false &&
					settings.Path == IOHelper.ResolveUrl("~/umbraco") &&
					settings.TimeOutInMinutes == 20 &&
					settings.DefaultUILanguage == "en" &&
					settings.LocalTempStorageLocation == LocalTempStorage.Default &&
					settings.LocalTempPath == IOHelper.MapPath("~/App_Data/TEMP") &&
					settings.ReservedPaths == ("~/app_plugins/,~/install/,~/mini-profiler-resources/,~/umbraco") &&
					settings.ReservedUrls == "~/config/splashes/noNodes.aspx,~/.well-known,");
			var typeLoader = new TypeLoader(appCaches.RuntimeCache, globalSettings.LocalTempPath, proflogger);

			var register = Umbraco.Core.Composing.RegisterFactory.Create();

			var composition = new Composition(register, typeLoader, proflogger, Mock.Of<IRuntimeState>());

			composition.RegisterUnique(typeLoader);
			composition.RegisterUnique(logger);
			composition.RegisterUnique(profiler);
			composition.RegisterUnique<IProfilingLogger>(proflogger);
			composition.RegisterUnique(appCaches);

			Current.Factory = composition.CreateFactory();

			return composition;
		}


		[TestInitialize()]
		public void Initialize() 
		{
			var composition = Composition();
			new Terratype.Register().Compose(composition);
			new Terratype.Providers.BingMapsV8Core.Register().Compose(composition);
			new Terratype.Providers.GoogleMapsV3Core.Register().Compose(composition);
			new Terratype.Providers.LeafletV1Core.Register().Compose(composition);
		}

		[TestMethod]
		public void CheckDI()
		{
			var bd09 = PositionBase.GetInstance<IPosition>(CoordinateSystems.Bd09._Id);
			Assert.IsNotNull(bd09);

			var gcj02 = PositionBase.GetInstance<IPosition>(CoordinateSystems.Gcj02._Id);
			Assert.IsNotNull(gcj02);

			var wgs84 = PositionBase.GetInstance<IPosition>(CoordinateSystems.Wgs84._Id);
			Assert.IsNotNull(wgs84);
		}

		private LatLng RandomLatLng()
		{
			return new LatLng()
			{
				Latitude = (rnd.NextDouble() * 180.0) - 90.0,
				Longitude = (rnd.NextDouble() * 360.0) - 180.0
			};
		}

		private double _delta = double.NaN;
		private double Delta
		{
			get
			{
				if (!Double.IsNaN(_delta))
				{
					return _delta;
				}

				_delta = 1.0;
				for (var count = 0; count != new Terratype.CoordinateSystems.Wgs84().Precision; count++)
				{
					_delta = _delta / 10.0;
				}
				return _delta;
			}
		}

		//  Note this is just a base test for testing expected C# behavour, if this fails then c# has changed
		[TestMethod]
		public void Double_ConvertToStringUsingDifferentCultures_DoubleIsConvertedWithCorrectCulturalSetting()
		{
			Thread.CurrentThread.CurrentCulture = new CultureInfo("");
			double d = -1.01;
			Assert.AreEqual(d.ToString(), "-1.01");

			Thread.CurrentThread.CurrentCulture = new CultureInfo("en-US");
			Assert.AreEqual(d.ToString(), "-1.01");

			Thread.CurrentThread.CurrentCulture = new CultureInfo("fr-FR");
			Assert.AreEqual(d.ToString(), "-1,01");

			Thread.CurrentThread.CurrentCulture = new CultureInfo("de-DE");
			Assert.AreEqual(d.ToString(), "-1,01");

		}

		[TestMethod]
		public void GMapsModel_ConvertToJsonAndBack_ShouldBeEqual()
		{
			foreach (var culture in Cultures)
			{
				Thread.CurrentThread.CurrentCulture = new CultureInfo(culture);

				var icon = new Icon()
				{
					Id = "test",
					Url = new Uri("http://mydomain.com/myfile.jpg"),
					Size = new Icon.SizeDefinition()
					{
						Width = 50,
						Height = 66
					},
					Anchor = new Icon.AnchorDefinition()
					{
						Vertical = 25,
						Horizontal = 33
					}
				};

				var provider = new Terratype.Providers.GoogleMapsV3()
				{
					Variety = new Terratype.Providers.GoogleMapsV3.VarietyDefinition()
					{
						Selector = new Terratype.Providers.GoogleMapsV3.VarietyDefinition.SelectorDefinition()
						{
							Type = Terratype.Providers.GoogleMapsV3.VarietyDefinition.SelectorType.Default,
							Position = Terratype.Providers.GoogleMapsV3.ControlPositions.BottomRight
						},
						Basic = true,
						Satellite = false,
						Terrain = true
					},
					StreetView = new Terratype.Providers.GoogleMapsV3.Control()
					{
						Enable = false,
						Position = Terratype.Providers.GoogleMapsV3.ControlPositions.RightBottom
					},
					Fullscreen = new Terratype.Providers.GoogleMapsV3.Control()
					{
						Enable = true,
						Position = Terratype.Providers.GoogleMapsV3.ControlPositions.LeftCenter
					},
					Scale = new Terratype.Providers.GoogleMapsV3.Control()
					{
						Enable = false,
						Position = Terratype.Providers.GoogleMapsV3.ControlPositions.TopLeft
					},
					ZoomControl = new Terratype.Providers.GoogleMapsV3.Control()
					{
						Enable = true,
						Position = Terratype.Providers.GoogleMapsV3.ControlPositions.BottomLeft
					},
					Search = new Terratype.Providers.GoogleMapsV3.SearchDefinition()
					{
						Enable = Terratype.Providers.GoogleMapsV3.SearchDefinition.SearchStatus.Autocomplete,
						Limit = new Terratype.Providers.GoogleMapsV3.SearchDefinition.LimitDefinition()
						{
							Countries = new string[] { "France", "Germany", "Italy", "United Kingdom" }
						}
					}
				};
				PrivateObject providerAccessor = new PrivateObject(provider);
				providerAccessor.SetProperty(nameof(Terratype.Providers.GoogleMapsV3.Version), "3");
				providerAccessor.SetProperty(nameof(Terratype.Providers.GoogleMapsV3.ApiKey), "XXXAAABBBCC1234567890abcdefghijklmnopqrstuvwxyz");
				providerAccessor.SetProperty(nameof(Terratype.Providers.GoogleMapsV3.ForceHttps), true);
				providerAccessor.SetProperty(nameof(Terratype.Providers.GoogleMapsV3.Language), "en-gb");
				providerAccessor.SetProperty(nameof(Terratype.Providers.GoogleMapsV3.PredefineStyling), "pretty");
				providerAccessor.SetProperty(nameof(Terratype.Providers.GoogleMapsV3.ShowRoads), false);
				providerAccessor.SetProperty(nameof(Terratype.Providers.GoogleMapsV3.ShowLandmarks), true);
				providerAccessor.SetProperty(nameof(Terratype.Providers.GoogleMapsV3.ShowLabels), false);


				var model = new Map()
				{
					Zoom = rnd.Next(19) + 1,
					Label = new Terratype.Labels.Standard()
					{
						Content = new HtmlString("<p>This is some text<p>")
					},
					SearchText = "Paris, France",
					Position = new Terratype.CoordinateSystems.Wgs84(RandomLatLng()),
				};

				//  Use private set to add properties to class
				PrivateObject accessor = new PrivateObject(model);
				accessor.SetProperty(nameof(Map.Provider), provider);
				accessor.SetProperty(nameof(Map.Icon), icon);

				var json = JsonConvert.SerializeObject(model);
				var model2 = new Map(json);
				model.Should().BeEquivalentTo<Map>(model2);
				var json2 = JsonConvert.SerializeObject(model2);
				Assert.AreEqual(json, json2);

			}
		}

		[TestMethod]
		public void LeafletModel_ConvertToJsonAndBack_ShouldBeEqual()
		{
			foreach (var culture in Cultures)
			{
				Thread.CurrentThread.CurrentCulture = new CultureInfo(culture);

				var icon = new Icon()
				{
					Id = "test",
					Url = new Uri("http://mydomain.com/myfile.jpg"),
					Size = new Icon.SizeDefinition()
					{
						Width = 50,
						Height = 66
					},
					Anchor = new Icon.AnchorDefinition()
					{
						Vertical = 25,
						Horizontal = 33
					}
				};

				var provider = new Terratype.Providers.LeafletV1()
				{
					MapSources = new Terratype.Providers.LeafletV1.MapSourceDefinition[] {
						new Terratype.Providers.LeafletV1.MapSourceDefinition {
							TileServer = new Terratype.Providers.LeafletV1.MapSourceDefinition.TileServerDefinition()
							{
								Id = "TileServerId1"
							},
							MinZoom = 0,
							MaxZoom = 10
						},
						new Terratype.Providers.LeafletV1.MapSourceDefinition {
							TileServer = new Terratype.Providers.LeafletV1.MapSourceDefinition.TileServerDefinition()
							{
								Id = "TileServerId2"
							},
							MinZoom = 11,
							MaxZoom = 20,
							Key = "AAAABBBBCCCCDDDD"
						}
					},
					ZoomControl = new Terratype.Providers.LeafletV1.ZoomControlDefinition()
					{
						Enable = true,
						Position = Terratype.Providers.LeafletV1.ControlPositions.BottomLeft
					},
				};

				var model = new Map()
				{
					Zoom = rnd.Next(19) + 1,
					Label = new Terratype.Labels.Standard()
					{
						Content = new HtmlString("<p>This is some text<p>")
					},
					SearchText = "Paris, France",
					Position = new Terratype.CoordinateSystems.Wgs84(RandomLatLng()),
				};

				//  Use private set to add properties to class
				PrivateObject accessor = new PrivateObject(model);
				accessor.SetProperty(nameof(Map.Provider), provider);
				accessor.SetProperty(nameof(Map.Icon), icon);

				var json = JsonConvert.SerializeObject(model);

				var model2 = new Map(json);

				model.Should().BeEquivalentTo<Map>(model2);

				var json2 = JsonConvert.SerializeObject(model2);

				Assert.AreEqual(json, json2);

			}
		}

		[TestMethod]
		public void BingModel_ConvertToJsonAndBack_ShouldBeEqual()
		{
			foreach (var culture in Cultures)
			{
				Thread.CurrentThread.CurrentCulture = new CultureInfo(culture);

				var icon = new Icon()
				{
					Id = "test",
					Url = new Uri("http://mydomain.com/myfile.jpg"),
					Size = new Icon.SizeDefinition()
					{
						Width = 50,
						Height = 66
					},
					Anchor = new Icon.AnchorDefinition()
					{
						Vertical = 25,
						Horizontal = 33
					}
				};

				var provider = new Terratype.Providers.BingMapsV8()
				{
					Version = "release",
					ApiKey = "abcdefghhijklmnopqrstuvwxyz",
					Language = "en-gb",
					Search = new Terratype.Providers.BingMapsV8.SearchDefinition()
					{
						Enable = Terratype.Providers.BingMapsV8.SearchDefinition.SearchStatus.Enable
					},
					Variety = new Terratype.Providers.BingMapsV8.VarietyDefinition()
					{
						Basic = false,
						Satellite = true,
						StreetView = true
					},
					Scale = new Terratype.Providers.BingMapsV8.Control()
					{
						Enable = false
					},
					ZoomControl = new Terratype.Providers.BingMapsV8.Control()
					{
						Enable = true
					},
					Traffic = new Terratype.Providers.BingMapsV8.TrafficDefinition()
					{
						Enable = true,
						Legend = true
					},
					ShowLabels = false
				};

				var model = new Map()
				{
					Zoom = rnd.Next(19) + 1,
					Label = new Terratype.Labels.Standard()
					{
						Content = new HtmlString("<p>This is some text<p>")
					},
					SearchText = "Paris, France",
					Position = new Terratype.CoordinateSystems.Wgs84(RandomLatLng()),
				};

				//  Use private set to add properties to class
				PrivateObject accessor = new PrivateObject(model);
				accessor.SetProperty(nameof(Map.Provider), provider);
				accessor.SetProperty(nameof(Map.Icon), icon);

				var json = JsonConvert.SerializeObject(model);
				var model2 = new Map(json);
				model.Should().BeEquivalentTo<Map>(model2);
				var json2 = JsonConvert.SerializeObject(model2);

				Assert.AreEqual(json, json2);

			}
		}
	}
}

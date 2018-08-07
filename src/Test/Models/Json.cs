﻿using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Globalization;
using System.Threading;
using System.Web;
using Newtonsoft.Json;
using FluentAssertions;
using Terratype.Models;

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


		[TestInitialize()]
		public void Initialize() 
		{
			Provider.RegisterType<Provider, Terratype.Providers.BingMapsV8>(Providers.BingMapsV8._Id);
			Provider.RegisterType<Provider, Terratype.Providers.GoogleMapsV3>(Providers.GoogleMapsV3._Id);
			Provider.RegisterType<Provider, Terratype.Providers.LeafletV1>(Providers.LeafletV1._Id);
			Position.RegisterType<Position, CoordinateSystems.Bd09>(CoordinateSystems.Bd09._Id);
			Position.RegisterType<Position, CoordinateSystems.Gcj02>(CoordinateSystems.Gcj02._Id);
			Position.RegisterType<Position, CoordinateSystems.Wgs84>(CoordinateSystems.Wgs84._Id);
			Label.RegisterType<Label, Labels.Standard>(Labels.Standard._Id);
		}

        private Terratype.Models.LatLng RandomLatLng()
        {
            return new Terratype.Models.LatLng()
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

                var icon = new Terratype.Models.Icon()
                {
                    Id = "test",
                    Url = new Uri("http://mydomain.com/myfile.jpg"),
                    Size = new Terratype.Models.Icon.SizeDefinition()
                    {
                        Width = 50,
                        Height = 66
                    },
                    Anchor = new Terratype.Models.Icon.AnchorDefinition()
                    {
                        Vertical = 25,
                        Horizontal = 33
                    }
                };

                var provider = new Terratype.Providers.GoogleMapsV3()
                {
                    Version = "3",
                    ApiKey = "XXXAAABBBCC1234567890abcdefghijklmnopqrstuvwxyz",
                    ForceHttps = true,
                    Language = "en-gb",
                    PredefineStyling = "pretty",
                    ShowRoads = false,
                    ShowLandmarks = true,
                    ShowLabels = false,
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

                var model = new Terratype.Models.Model()
                {
                    Zoom = rnd.Next(19) + 1,
                    Label = new Terratype.Labels.Standard()
                    {
                        Content = new HtmlString("<p>This is some text<p>")
                    },
                    Lookup = "Paris, France",
                    Position = new Terratype.CoordinateSystems.Wgs84(RandomLatLng()),
                };

                //  Use private set to add properties to class
                PrivateObject accessor = new PrivateObject(model);
                accessor.SetProperty(nameof(Terratype.Models.Model.Provider), provider);
                accessor.SetProperty(nameof(Terratype.Models.Model.Icon), icon);

                var json = JsonConvert.SerializeObject(model);

                var model2 = new Terratype.Models.Model(json);

                model.ShouldBeEquivalentTo<Terratype.Models.Model>(model2);

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

                var icon = new Terratype.Models.Icon()
                {
                    Id = "test",
                    Url = new Uri("http://mydomain.com/myfile.jpg"),
                    Size = new Terratype.Models.Icon.SizeDefinition()
                    {
                        Width = 50,
                        Height = 66
                    },
                    Anchor = new Terratype.Models.Icon.AnchorDefinition()
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

                var model = new Terratype.Models.Model()
                {
                    Zoom = rnd.Next(19) + 1,
                    Label = new Terratype.Labels.Standard()
                    {
                        Content = new HtmlString("<p>This is some text<p>")
                    },
                    Lookup = "Paris, France",
                    Position = new Terratype.CoordinateSystems.Wgs84(RandomLatLng()),
                };

                //  Use private set to add properties to class
                PrivateObject accessor = new PrivateObject(model);
                accessor.SetProperty(nameof(Terratype.Models.Model.Provider), provider);
                accessor.SetProperty(nameof(Terratype.Models.Model.Icon), icon);

                var json = JsonConvert.SerializeObject(model);

                var model2 = new Terratype.Models.Model(json);

                model.ShouldBeEquivalentTo<Terratype.Models.Model>(model2);

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

                var icon = new Terratype.Models.Icon()
                {
                    Id = "test",
                    Url = new Uri("http://mydomain.com/myfile.jpg"),
                    Size = new Terratype.Models.Icon.SizeDefinition()
                    {
                        Width = 50,
                        Height = 66
                    },
                    Anchor = new Terratype.Models.Icon.AnchorDefinition()
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

                var model = new Terratype.Models.Model()
                {
                    Zoom = rnd.Next(19) + 1,
                    Label = new Terratype.Labels.Standard()
                    {
                        Content = new HtmlString("<p>This is some text<p>")
                    },
                    Lookup = "Paris, France",
                    Position = new Terratype.CoordinateSystems.Wgs84(RandomLatLng()),
                };

                //  Use private set to add properties to class
                PrivateObject accessor = new PrivateObject(model);
                accessor.SetProperty(nameof(Terratype.Models.Model.Provider), provider);
                accessor.SetProperty(nameof(Terratype.Models.Model.Icon), icon);

                var json = JsonConvert.SerializeObject(model);

                var model2 = new Terratype.Models.Model(json);

                model.ShouldBeEquivalentTo<Terratype.Models.Model>(model2);

                var json2 = JsonConvert.SerializeObject(model2);

                Assert.AreEqual(json, json2);

            }
        }
    }
}

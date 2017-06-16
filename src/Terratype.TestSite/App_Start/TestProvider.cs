
using Umbraco.Core;

namespace Terratype.TestSite.App_Start
{
    public class TestProvider
    {
        /// <summary>
        /// Create a content node in the root of the content tree
        /// </summary>
        /// <param name="nodeName">Name of the node</param>
        /// <param name="latitude">Latitude of the map marker</param>
        /// <param name="longitude">Longitude of the map marker</param>
        /// <param name="label">The text to appear if the user clicks the map marker</param>
        /// <returns></returns>
        public bool CreateMapContent(string nodeName, double latitude, double longitude, string label)
        {
            var content = Umbraco.Core.ApplicationContext.Current.Services.ContentService.CreateContent(nodeName, -1, "mydoctype", 0);
            var json = "{zoom: 5,label: {content: " + label + ",id: \"standard\",enable: true,editPosition: 0," +
                "view: \"/App_Plugins/Terratype/views/label.standard.html?cache=1.0.12\",controller: \"terratype.label.standard\"}" +
                "position: {id: \"WGS84\",datum: " + latitude.ToString(System.Globalization.CultureInfo.InvariantCulture) + "," +
                longitude.ToString(System.Globalization.CultureInfo.InvariantCulture) + "}";
            content.SetValue("mymap", json);
            return ApplicationContext.Current.Services.ContentService.SaveAndPublishWithStatus(content).Success;
        }


        public TestProvider()
        {
            foreach (System.Reflection.Assembly currAssembly in System.AppDomain.CurrentDomain.GetAssemblies())
            {

                System.Type[] typesInAsm;
			    try
			    {
				    typesInAsm = currAssembly.GetTypes();
			    }
			    catch (System.Reflection.ReflectionTypeLoadException ex)
			    {
				    typesInAsm = ex.Types;
			    }

			    foreach (System.Type type in typesInAsm)
			    {
				    if (type == null || !type.IsClass || type.IsAbstract)
				    {
					    continue;
				    }

				    if (type.IsSubclassOf(typeof(Terratype.Models.Provider)))
				    {
                        System.Diagnostics.Debug.WriteLine("Already Loaded: " + type.FullName);
				    }

			    }
            }

            var path = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);

            var di = new System.IO.DirectoryInfo(path);
            foreach (var file in di.GetFiles("*.dll"))
            {
                try
                {
                    var currAssembly = System.Reflection.Assembly.ReflectionOnlyLoadFrom(file.FullName);
				    System.Type[] typesInAsm;
				    try
				    {
					    typesInAsm = currAssembly.GetTypes();
				    }
				    catch (System.Reflection.ReflectionTypeLoadException ex)
				    {
					    typesInAsm = ex.Types;
				    }

				    foreach (System.Type type in typesInAsm)
				    {
					    if (type == null || !type.IsClass || type.IsAbstract)
					    {
						    continue;
					    }

					    if (type.IsSubclassOf(typeof(Terratype.Models.Provider)))
					    {
                            System.Diagnostics.Debug.WriteLine("Can load: " + type.FullName);
					    }

				    }
                }
                catch (System.BadImageFormatException)
                {
                    // Not a .net assembly  - ignore
                }
            }
        }
    }
}
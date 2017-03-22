
namespace Terratype.TestSite.App_Start
{
    public class TestProvider
    {
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
namespace Terratype.Indexer
{
	public static class Helper
	{
		public static bool IsJson(string json)
		{
            json = json.Trim();
			var end = json.Length - 1;
            return (json[0] == '{' && json[end] == '}') || 
				(json[0] == '[' && json[end] == ']');
		}
	}
}

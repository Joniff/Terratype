using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Terratype.Indexer.ProcessorService;
using Umbraco.Core.Services;

namespace Terratype.Indexer.Processors
{
	public class GridProcessor : PropertyBase
	{
		public GridProcessor(IList<Entry> results, Stack<Task> tasks, IDataTypeService dataTypeService) : base(results, tasks, dataTypeService)
		{
		}

		public override bool Process(Task task)
		{
			if (string.Compare(task.PropertyEditorAlias, "Umbraco.Grid", true) != 0 || 
				task.Json.Type != JTokenType.Object || ((int?)task.DataTypeId) == null)
			{
				return false;
			}
			
			//	Sections
			var nameType = ((JObject) task.Json).GetValue("name", StringComparison.InvariantCultureIgnoreCase);
			var sectionsType = ((JObject) task.Json).GetValue("sections", StringComparison.InvariantCultureIgnoreCase);

			if (nameType == null || nameType.Type != JTokenType.String || sectionsType == null || sectionsType.Type != JTokenType.Array)
			{
				return false;
			}

			var sectionIndex = 0;
			foreach (var section in sectionsType)
			{
				//	Section
				if (section.Type == JTokenType.Object)
				{
					var rows = ((JObject) section).GetValue("rows", StringComparison.InvariantCultureIgnoreCase);
					if (rows != null && rows.Type == JTokenType.Array)
					{
						foreach (var row in rows)
						{
							//	Row
							if (row.Type == JTokenType.Object)
							{
								var rowIdType = ((JObject) row).GetValue("id", StringComparison.InvariantCultureIgnoreCase);
								var areas = ((JObject) row).GetValue("areas", StringComparison.InvariantCultureIgnoreCase);

								if (rowIdType != null && rowIdType.Type == JTokenType.String && areas != null && areas.Type == JTokenType.Array)
								{
									var areaIndex = 0;
									foreach (var area in areas)
									{
										//	Area
										if (area.Type == JTokenType.Object)
										{
											var controls = ((JObject) area).GetValue("controls", StringComparison.InvariantCultureIgnoreCase);

											if (controls.Type == JTokenType.Array)
											{
												var controlIndex = 0;
												foreach (var control in controls)
												{
													//	Control
													if (area.Type == JTokenType.Object)
													{
														var valueType = ((JObject) control).GetValue("value", StringComparison.InvariantCultureIgnoreCase);
														var editorType = ((JObject) control).GetValue("editor", StringComparison.InvariantCultureIgnoreCase);

														if (valueType != null && (valueType.Type == JTokenType.Object || valueType.Type == JTokenType.Array) && editorType != null && 
															editorType.Type == JTokenType.Object)
														{
															var editorAliasType = ((JObject) editorType).GetValue("alias", StringComparison.InvariantCultureIgnoreCase);
															if (editorAliasType != null && editorAliasType.Type == JTokenType.String)
															{
																Tasks.Push(new Task(task.Id, task.Ancestors, editorAliasType.Value<string>(), valueType,
																	new DataTypeId(DataTypeService), task.Keys, sectionIndex, rowIdType.Value<string>(), areaIndex, controlIndex));
															}
														}
													}
													controlIndex++;
												}
											}
										}
										areaIndex++;
									}
								}
							}
						}
					}
				}
				sectionIndex++;
			}

			return true;
		}
	}
}

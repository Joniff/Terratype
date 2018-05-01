using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Terratype.Frisk;

namespace Terratype.Indexer.Searchers
{
	public interface ISearchRequest
	{
	}

	public interface ISearch<ISearchRequest> : IFrisk
	{
	}
}

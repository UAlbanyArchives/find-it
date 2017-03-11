# Comma-separated list of ArchivesSpace API endpoints you want accessible via Javascript
CORS_ENDPOINTS = ['/version', '/users/current-user', '/locations/:id', '/repositories/:repo_id/find_by_id/archival_objects', '/repositories/:repo_id/archival_objects/:id', '/repositories/:repo_id/resources/:id', '/repositories/:repo_id/search']
class CORSMiddleware

  def initialize(app)
    @app = app
    @patterns = build_patterns(CORS_ENDPOINTS)
  end

  def call(env)
    result = @app.call(env)

    # Add CORS headers to specific endpoints
    if env['REQUEST_METHOD'] == 'GET' &&
       result[0] == 200 &&
       @patterns.any? {|pattern| env['PATH_INFO'] =~ pattern}

      # Add CORS headers
      headers = result[1]
      headers["Access-Control-Allow-Origin"] = "*"
      headers["Access-Control-Allow-Methods"] = "GET"
      headers["Access-Control-Allow-Headers"] = "X-ArchivesSpace-Session"
    end

    result
  end

  private

  def build_patterns(uri_templates)
    uri_templates.map {|uri|
      regex = uri.gsub(/:[a-z_]+/, '[^/]+')
      Regexp.compile("\\A#{regex}$\\z")}
  end

end


# Support OPTIONS, which is necessary for certain browsers (for example Google Chrome)
CORS_ENDPOINTS.each do |uri|
  ArchivesSpaceService.options uri do
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET"
    response.headers["Access-Control-Allow-Headers"] = "X-ArchivesSpace-Session"

    halt 200
  end
end

# Add Rack middleware to ArchivesSpace
ArchivesSpaceService.use(CORSMiddleware)

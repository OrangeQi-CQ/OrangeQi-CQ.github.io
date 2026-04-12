class Jekyll::PostReader
  # Don't use DATE_FILENAME_MATCHER so we don't need to put dates in the filename
  def read_posts(dir)
    read_publishable(dir, "_posts", /.*\.md$/)
  end
  def read_drafts(dir)
    read_publishable(dir, "_drafts", /.*\.md$/)
  end
end
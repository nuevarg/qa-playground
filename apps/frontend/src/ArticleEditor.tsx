import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  createArticle,
  updateArticle,
  getArticle,
} from "./api/articles";
import { getApiErrorMessages } from "./api/errors";
import { TEST_ID } from "./constant/testIds.ts";

type CurrentUser = {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
};

type ArticleEditorProps = {
  currentUser: CurrentUser | null;
};

function ArticleEditor({ currentUser }: ArticleEditorProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!slug) {
      setTitle("");
      setDescription("");
      setBody("");
      setTagsInput("");
      return;
    }

    const controller = new AbortController();
    const fetchArticle = async () => {
      setIsLoading(true);
      setErrorMessages([]);
      try {
        const res = await getArticle(slug, controller.signal);
        // Only allow author to edit
        if (res.article.author.username !== currentUser.username) {
          navigate(`/article/${slug}`);
          return;
        }
        setTitle(res.article.title);
        setDescription(res.article.description);
        setBody(res.article.body);
        setTagsInput(res.article.tagList.join(", "));
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessages(
          getApiErrorMessages(error, "Failed to load article details for editing.")
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchArticle();

    return () => controller.abort();
  }, [slug, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessages([]);

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const articleData = {
      title: title.trim(),
      description: description.trim(),
      body: body.trim(),
      tagList: parsedTags,
    };

    try {
      let result;
      if (slug) {
        result = await updateArticle(slug, articleData);
      } else {
        result = await createArticle(articleData);
      }
      navigate(`/article/${result.article.slug}`);
    } catch (error) {
      setErrorMessages(
        getApiErrorMessages(
          error,
          slug ? "Failed to update article." : "Failed to create article."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <article className="card" data-testid={TEST_ID.EDITOR.PAGE}>
        <h1 className="card-title">{slug ? "Edit Article" : "New Article"}</h1>
        <span className="status-badge">Loading article data...</span>
      </article>
    );
  }

  return (
    <article className="card" data-testid={TEST_ID.EDITOR.PAGE}>
      <h1 className="card-title">{slug ? "Edit Article" : "Create New Article"}</h1>
      <p className="form-help">
        {slug
          ? "Modify the fields below to update your article on the Global Feed."
          : "Fill in the details to publish a new article on the Global Feed."}
      </p>

      {errorMessages.length > 0 && (
        <div className="form-error" data-testid={TEST_ID.EDITOR.ERROR}>
          <ul className="error-list">
            {errorMessages.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="article-title">Title</label>
          <input
            id="article-title"
            data-testid={TEST_ID.EDITOR.TITLE_INPUT}
            disabled={isSubmitting}
            placeholder="Article Title"
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="article-description">Description</label>
          <input
            id="article-description"
            data-testid={TEST_ID.EDITOR.DESC_INPUT}
            disabled={isSubmitting}
            placeholder="What's this article about?"
            required
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="article-body">Body</label>
          <textarea
            id="article-body"
            data-testid={TEST_ID.EDITOR.BODY_INPUT}
            disabled={isSubmitting}
            placeholder="Write your article (markdown format supported by formatting)"
            required
            rows={8}
            style={{
              width: "100%",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "12px 14px",
              font: "inherit",
              resize: "vertical",
            }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="article-tags">Tags (comma-separated)</label>
          <input
            id="article-tags"
            data-testid={TEST_ID.EDITOR.TAGS_INPUT}
            disabled={isSubmitting}
            placeholder="e.g. react, testing, automation"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        <div className="card-actions" style={{ gap: "12px" }}>
          <Link className="secondary-button" to="/feed">
            Cancel
          </Link>
          <button
            className="primary-button compact-button"
            data-testid={TEST_ID.EDITOR.SUBMIT_BUTTON}
            disabled={isSubmitting || !title || !description || !body}
            type="submit"
          >
            {isSubmitting
              ? slug
                ? "Updating..."
                : "Publishing..."
              : slug
                ? "Update Article"
                : "Publish Article"}
          </button>
        </div>
      </form>
    </article>
  );
}

export default ArticleEditor;

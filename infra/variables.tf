variable "root_domain" {
  description = "Route 53 hosted zone the site lives under."
  type        = string
  default     = "spixionic.com"
}

variable "subdomain" {
  description = "Subdomain for the site."
  type        = string
  default     = "practice-chess-openings"
}

variable "bucket_name" {
  description = "S3 bucket for the built site. Must be globally unique."
  type        = string
  default     = "spixionic-practice-chess-openings-site"
}

variable "github_repo" {
  description = "GitHub repo (owner/name) allowed to deploy from its main branch."
  type        = string
  default     = "bprieto12/practice-chess-openings"
}

variable "create_github_oidc_provider" {
  description = "Create the GitHub Actions OIDC provider. An AWS account can only have one, so set false if it already exists."
  type        = bool
  default     = true
}

variable "price_class" {
  description = "CloudFront edge locations. PriceClass_100 (North America and Europe) is cheapest once past the free tier."
  type        = string
  default     = "PriceClass_100"
}

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

# The repo uses GitHub's immutable OIDC subject format, which includes numeric
# IDs so a renamed or re-created repo can't inherit access. Find them with:
#   gh api repos/OWNER/NAME --jq '"\(.owner.id) \(.id)"'
variable "github_owner_id" {
  description = "Numeric GitHub ID of the repo owner."
  type        = number
  default     = 10649089
}

variable "github_repo_id" {
  description = "Numeric GitHub ID of the repo."
  type        = number
  default     = 1430558186
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
